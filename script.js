let nodos = [];
let lineas = [];
let tamanoHex = 25; 

// Variables de control de la cámara (Scroll)
let camaraY = 0;
let destinoCamaraY = 0; 

function setup() {
    // Creamos un lienzo vertical
    createCanvas(600, 850);
    
    // Nodo inicial raíz (Base del tronco)
    let nodoInicial = {
        x: width / 2,
        y: height - 150,
        tipo: 'tronco',
        color: color('#a0a0a0')
    };
    nodos.push(nodoInicial);
    
    // Forzar la primera ramificación para iniciar el juego
    ramificar(nodoInicial);
}

function draw() {
    background(35); // Color gris oscuro de fondo
    
    // Interpolación lineal (lerp) para suavizar el movimiento de la cámara
    camaraY = lerp(camaraY, destinoCamaraY, 0.1);

    // Dibujar cuadrícula de fondo que se mueve con el scroll
    dibujarCuadrícula();

    push();
    // Movemos toda la matriz gráfica en el eje Y según la cámara
    translate(0, camaraY);

    // 1. DIBUJAR LÍNEAS / CONEXIONES EN ZIGZAG
    strokeWeight(3);
    for (let l of lineas) {
        let medX = (l.p1.x + l.p2.x) / 2;
        let medY = (l.p1.y + l.p2.y) / 2;
        
        // Si ambos extremos están activos, la línea brilla más
        if (l.p1.tipo !== 'vacio' && l.p2.tipo !== 'vacio') {
            stroke(255, 210); 
        } else {
            stroke(255, 70); 
        }

        noFill();
        beginShape();
        vertex(l.p1.x, l.p1.y);
        // Punto de quiebre para simular estética de circuitos de la imagen
        vertex(medX + (l.p1.x < l.p2.x ? -12 : 12), (l.p1.y + medY) / 2); 
        vertex(medX, medY);
        vertex(l.p2.x, l.p2.y);
        endShape();
    }

    // 2. DIBUJAR NODOS HEXAGONALES
    for (let n of nodos) {
        // Adaptamos la posición real del mouse restando el movimiento de la cámara
        let mouseMundialY = mouseY - camaraY;

        if (n.tipo === 'vacio') {
            // Estilo nodo bloqueado / por activar
            stroke(255, 110);
            strokeWeight(2);
            noFill();
            dibujarHexagono(n.x, n.y, tamanoHex);
            
            // Efecto Visual Hover
            if (dist(mouseX, mouseMundialY, n.x, n.y) < tamanoHex) {
                fill(255, 45);
                dibujarHexagono(n.x, n.y, tamanoHex - 4);
            }
        } else {
            // Estilo nodo de color activado
            stroke(255);
            strokeWeight(2);
            fill(n.color);
            dibujarHexagono(n.x, n.y, tamanoHex);
            
            // Pequeño núcleo brillante al centro
            fill(255, 160);
            noStroke();
            ellipse(n.x, n.y, 8, 8);
        }
    }
    pop();
}

// CAPTURA DEL SCROLL (Rueda del ratón)
function mouseWheel(event) {
    // Al girar la rueda alteramos el destino al que quiere ir la cámara
    destinoCamaraY -= event.delta * 0.8;
    
    // Límite inferior: Evita que pases hacia abajo del suelo inicial
    if (destinoCamaraY < 0) {
        destinoCamaraY = 0;
    }
    
    // Evitamos que la rueda haga scroll en la ventana del navegador completo
    return false;
}

// INTERACCIÓN POR CLIC EN LOS NODOS Vacíos
function mousePressed() {
    if (mouseButton === LEFT) {
        let mouseMundialY = mouseY - camaraY;

        for (let n of nodos) {
            if (n.tipo === 'vacio' && dist(mouseX, mouseMundialY, n.x, n.y) < tamanoHex) {
                
                // Paleta de colores neón tomados del concepto original
                let colores = [
                    color('#4ecdc4'), // Turquesa
                    color('#ff6b6b'), // Fucsia / Coral
                    color('#a29bfe')  // Lila / Violeta
                ];
                
                n.tipo = 'color';
                n.color = random(colores);
                
                // Expandir el árbol de manera procedural desde este nodo
                ramificar(n);

                // Ayuda de cámara: Si activas un nodo muy arriba, la pantalla sube un poco sola
                if (mouseY < 250) {
                    destinoCamaraY += 120;
                }
                break; 
            }
        }
    }
}

// LÓGICA DE RAMIFICACIÓN HACIA ARRIBA
function ramificar(nodoPadre) {
    let cantidadRamas = floor(random(1, 4)); // Crea entre 1 y 3 caminos nuevos
    let angulos = [-QUARTER_PI, -HALF_PI, -3 * QUARTER_PI]; // Diagonales arriba e Izq/Der
    
    angulos = shuffle(angulos); // Aleatoriedad en las direcciones tomadas

    for (let i = 0; i < cantidadRamas; i++) {
        let distancia = random(90, 140);
        let angulo = angulos[i];
        
        let nuevoX = nodoPadre.x + cos(angulo) * distancia;
        let nuevoY = nodoPadre.y + sin(angulo) * distancia;

        // Limitar márgenes izquierdo y derecho del canvas
        if (nuevoX < 50 || nuevoX > width - 50) continue;

        let nuevoNodo = {
            x: nuevoX,
            y: nuevoY,
            tipo: 'vacio',
            color: color(0)
        };

        // Algoritmo de colisión básica para evitar que los hexágonos se pisen entre sí
        let superpuesto = false;
        for (let existente of nodos) {
            if (dist(nuevoX, nuevoY, existente.x, existente.y) < tamanoHex * 2.2) {
                superpuesto = true;
                break;
            }
        }

        if (!superpuesto) {
            nodos.push(nuevoNodo);
            lineas.push({ p1: nodoPadre, p2: nuevoNodo });
        }
    }
}

// DIBUJO GEOMÉTRICO DE HEXÁGONOS EN VERTICAL
function dibujarHexagono(x, y, radio) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
        // Desfase en el cálculo del ángulo para que apunten de forma estilizada hacia arriba
        let hx = x + cos(a + HALF_PI / 3) * radio;
        let hy = y + sin(a + HALF_PI / 3) * radio;
        vertex(hx, hy);
    }
    endShape(CLOSE);
}

// LÍNEAS DE CUADRÍCULA DE REFERENCIA ESPACIAL
function dibujarCuadrícula() {
    stroke(255, 12);
    strokeWeight(1);
    let inicioY = camaraY % 100;
    for (let y = inicioY; y < height; y += 100) {
        line(0, y, width, y);
    }
}