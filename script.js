// Estructuras de datos del mapa
let nodos = [];
let lineas = [];
let tamanoHex = 25; 

// Variables de la Cámara y Scroll suave
let camaraY = 0;
let destinoCamaraY = 0; 

// Configuración de la Meta y el Enemigo
let alturaMeta = -1600; 
let nodoMeta = null;
let estadoJuego = "MENU"; // Estados: "MENU", "JUGANDO", "VICTORIA", "DERROTA"

let enemigoY; 
let velocidadEnemigo = 1.0; 

// Estructura de los Rombos/Botones del Menú Principal
let botonesMenu = [];

function setup() {
    createCanvas(600, 850);
    
    // Coordenadas y configuraciones para los 3 rombos del menú de dificultad
    botonesMenu = [
        { x: width / 2 - 140, y: height / 2 + 80, texto: "NOVATO", vel: 0.85, color: '#4ecdc4', radio: 55 },
        { x: width / 2,       y: height / 2 + 80, texto: "EXPERTO", vel: 1.30, color: '#a29bfe', radio: 55 },
        { x: width / 2 + 140, y: height / 2 + 80, texto: "HACKER", vel: 1.85, color: '#ff6b6b', radio: 55 }
    ];
}

function inicializarJuego(velSeleccionada) {
    nodos = [];
    lineas = [];
    camaraY = 0;
    destinoCamaraY = 0;
    velocidadEnemigo = velSeleccionada;
    estadoJuego = "JUGANDO";
    
    // Mostrar la barra de instrucciones usando el DOM de HTML
    document.getElementById('instrucciones').style.opacity = "1";

    // El enemigo inicia en la parte inferior del canvas
    enemigoY = height - 50;

    // Colocación del nodo raíz (Base del árbol)
    let nodoInicial = {
        x: width / 2,
        y: height - 150,
        tipo: 'tronco',
        color: color('#a0a0a0')
    };
    nodos.push(nodoInicial);
    ramificar(nodoInicial);

    // Colocación fija de la Meta Dorada en el mapa superior
    nodoMeta = {
        x: width / 2,
        y: alturaMeta,
        tipo: 'meta',
        color: color('#ffd700') 
    };
    nodos.push(nodoMeta);
}

function draw() {
    background(21); // Fondo gris oscuro/azul cibernético

    if (estadoJuego === "MENU") {
        dibujarMenuInicio();
    } else {
        // --- LOOP DE JUEGO ACTIVO ---
        camaraY = lerp(camaraY, destinoCamaraY, 0.1); // Interpolación de scroll
        dibujarCuadrícula();

        if (estadoJuego === "JUGANDO") {
            enemigoY -= velocidadEnemigo; // El enemigo avanza hacia arriba

            // Calcular el nodo activo más alto del jugador para medir colisión
            let nodoMasAltoJugador = height;
            for (let n of nodos) {
                if ((n.tipo === 'color' || n.tipo === 'tronco') && n.y < nodoMasAltoJugador) {
                    nodoMasAltoJugador = n.y;
                }
            }
            // Si la línea roja te alcanza, se activa el Game Over
            if (enemigoY < nodoMasAltoJugador + tamanoHex) {
                estadoJuego = "DERROTA";
            }
        }

        // Renderizado del mapa transformado por la posición de la cámara
        push();
        translate(0, camaraY);

        // 1. Renderizado de las Líneas/Ramas
        strokeWeight(3);
        for (let l of lineas) {
            let medX = (l.p1.x + l.p2.x) / 2;
            let medY = (l.p1.y + l.p2.y) / 2;
            
            if (l.p1.tipo !== 'vacio' && l.p2.tipo !== 'vacio') {
                stroke(255, 210); 
            } else {
                stroke(255, 50);  
            }
            noFill();
            beginShape();
            vertex(l.p1.x, l.p1.y);
            vertex(medX + (l.p1.x < l.p2.x ? -12 : 12), (l.p1.y + medY) / 2); 
            vertex(medX, medY);
            vertex(l.p2.x, l.p2.y);
            endShape();
        }

        // 2. Renderizado Visual del Enemigo (Niebla de corrupción roja)
        noStroke();
        fill(255, 30, 30, 85); 
        rect(0, enemigoY, width, height - enemigoY + 2000);
        
        stroke(255, 60, 60);
        strokeWeight(4);
        for (let x = 0; x < width; x += 20) {
            line(x, enemigoY + sin(frameCount * 0.12 + x) * 6, x + 20, enemigoY + sin(frameCount * 0.12 + x + 20) * 6);
        }

        // 3. Renderizado de los Nodos del Escenario
        for (let n of nodos) {
            let mouseMundialY = mouseY - camaraY;

            if (n.tipo === 'vacio') {
                stroke(255, 110);
                strokeWeight(2);
                noFill();
                dibujarHexagono(n.x, n.y, tamanoHex);
                
                if (estadoJuego === "JUGANDO" && dist(mouseX, mouseMundialY, n.x, n.y) < tamanoHex) {
                    fill(255, 45);
                    dibujarHexagono(n.x, n.y, tamanoHex - 4);
                }
            } else if (n.tipo === 'meta') {
                stroke(255, 215, 0);
                strokeWeight(3);
                fill(n.color);
                dibujarHexagono(n.x, n.y, tamanoHex + 12);
                
                fill(255, 255, 255, 120 + sin(frameCount * 0.15) * 60);
                dibujarHexagono(n.x, n.y, tamanoHex);
            } else {
                stroke(255);
                strokeWeight(2);
                fill(n.color);
                dibujarHexagono(n.x, n.y, tamanoHex);
                
                fill(255, 160);
                noStroke();
                ellipse(n.x, n.y, 8, 8);
            }
        }
        pop();

        // Modales superpuestos de fin de partida
        if (estadoJuego === "VICTORIA") {
            dibujarPantallaFin("¡VICTORIA!", "Lograste hackear el sistema y asegurar el núcleo dorado.", color('#4ecdc4'));
        } else if (estadoJuego === "DERROTA") {
            dibujarPantallaFin("CONEXIÓN PERDIDA", "La ramificación corrupta sobreescribió tus datos.", color('#ff6b6b'));
        }
    }
}

// --- PANTALLA DE INICIO (MENÚ INTERACTIVO) ---
function dibujarMenuInicio() {
    // Reutilizar la cuadrícula estática de fondo para estética de datos
    stroke(255, 6);
    strokeWeight(1);
    for (let y = 0; y < height; y += 80) line(0, y, width, y);
    for (let x = 0; x < width; x += 80) line(x, 0, x, height);

    textAlign(CENTER, CENTER);
    
    // Polígono geométrico decorativo en el centro
    noFill();
    stroke(255, 15);
    dibujarHexagono(width / 2, height / 2 - 130, 160);

    // Tipografías y Títulos
    noStroke();
    fill(255);
    textSize(42);
    textStyle(BOLD);
    text("INF-ARBOL", width / 2, height / 2 - 160);
    
    fill('#a29bfe');
    textSize(16);
    textStyle(NORMAL);
    text("CYBER INTERACTIVE SYSTEM", width / 2, height / 2 - 110);

    fill(200);
    textSize(14);
    text("SELECCIONA TU NIVEL DE ACCESO", width / 2, height / 2 - 10);

    // Dibujar y procesar botones del menú (Rombos Dificultad)
    for (let btn of botonesMenu) {
        let d = dist(mouseX, mouseY, btn.x, btn.y);
        let esHover = (d < btn.radio);

        if (esHover) {
            // Animación iluminada interactiva
            stroke(btn.color);
            strokeWeight(3);
            fill(red(color(btn.color)), green(color(btn.color)), blue(color(btn.color)), 45);
            dibujarHexagono(btn.x, btn.y, btn.radio + 4);
        } else {
            // Estado por defecto pasivo
            stroke(255, 120);
            strokeWeight(1.5);
            fill(30);
            dibujarHexagono(btn.x, btn.y, btn.radio);
        }

        // Títulos de dificultad
        noStroke();
        if (esHover) fill(255); 
        else fill(210);
        
        textSize(13);
        textStyle(BOLD);
        text(btn.texto, btn.x, btn.y - 8);
        
        // Texto secundario interno de velocidad
        textSize(9);
        textStyle(NORMAL);
        fill(esHover ? btn.color : 'rgba(255,255,255,0.4)');
        let modoVel = btn.texto === "NOVATO" ? "VEL: MEDIA" : btn.texto === "EXPERTO" ? "VEL: ALTA" : "VEL: ULTRA";
        text(modoVel, btn.x, btn.y + 12);
    }
}

// GESTIÓN DE CLICS EN PANTALLA
function mousePressed() {
    // Interacciones del Menú Principal
    if (estadoJuego === "MENU" && mouseButton === LEFT) {
        for (let btn of botonesMenu) {
            if (dist(mouseX, mouseY, btn.x, btn.y) < btn.radio) {
                inicializarJuego(btn.vel); // Arranca el juego con la velocidad asociada
                break;
            }
        }
        return;
    }

    // Interacciones del Juego Activo
    if (estadoJuego === "JUGANDO" && mouseButton === LEFT) {
        let mouseMundialY = mouseY - camaraY;

        // Intentar activar un nodo estándar vacío
        for (let n of nodos) {
            if (n.tipo === 'vacio' && dist(mouseX, mouseMundialY, n.x, n.y) < tamanoHex) {
                let colores = [color('#4ecdc4'), color('#ff6b6b'), color('#a29bfe')];
                n.tipo = 'color';
                n.color = random(colores);
                
                ramificar(n);

                // Desplazamiento automático preventivo de cámara al construir arriba
                if (mouseY < height / 2) {
                    destinoCamaraY += 145;
                }
                break; 
            }
        }

        // Validar conexión con la Meta Dorada
        if (dist(mouseX, mouseMundialY, nodoMeta.x, nodoMeta.y) < tamanoHex * 3) {
            for (let n of nodos) {
                if (n.tipo === 'color' && dist(n.x, n.y, nodoMeta.x, nodoMeta.y) < 160) {
                    lineas.push({ p1: n, p2: nodoMeta });
                    estadoJuego = "VICTORIA";
                    break;
                }
            }
        }
    }
}

// MANEJO DE LA RUEDA DEL RATÓN (SCROLL)
function mouseWheel(event) {
    if (estadoJuego === "MENU") return;
    destinoCamaraY -= event.delta * 0.85;
    if (destinoCamaraY < 0) destinoCamaraY = 0;
    return false; // Evita el scroll nativo del explorador web
}

// CONTROL DE TECLADO PARA REINICIAR AL MENÚ
function keyPressed() {
    if ((estadoJuego === "VICTORIA" || estadoJuego === "DERROTA") && keyCode === ENTER) {
        document.getElementById('instrucciones').style.opacity = "0";
        estadoJuego = "MENU";
    }
}

// GENERACIÓN PROCEDURAL DE RAMAS SUPERIORES
function ramificar(nodoPadre) {
    if (nodoPadre.y < alturaMeta + 120) return; 

    let cantidadRamas = floor(random(1, 4)); 
    let angulos = [-QUARTER_PI, -HALF_PI, -3 * QUARTER_PI]; 
    angulos = shuffle(angulos);

    for (let i = 0; i < cantidadRamas; i++) {
        let distancia = random(95, 135);
        let angulo = angulos[i];
        
        let nuevoX = nodoPadre.x + cos(angulo) * distancia;
        let nuevoY = nodoPadre.y + sin(angulo) * distancia;

        if (nuevoX < 60 || nuevoX > width - 60) continue;

        let nuevoNodo = {
            x: nuevoX,
            y: nuevoY,
            tipo: 'vacio',
            color: color(0)
        };

        // Prevención de superposiciones complejas entre hexágonos vecinos
        let superpuesto = false;
        for (let existente of nodos) {
            if (dist(nuevoX, nuevoY, existente.x, existente.y) < tamanoHex * 2.1) {
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

// FUNCIÓN MATEMÁTICA: Dibujar hexágonos/rombos verticales de forma perfecta
function dibujarHexagono(x, y, radio) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
        let hx = x + cos(a + HALF_PI / 3) * radio;
        let hy = y + sin(a + HALF_PI / 3) * radio;
        vertex(hx, hy);
    }
    endShape(CLOSE);
}

// DIBUJAR LÍNEAS DE FONDO HORIZONTALES
function dibujarCuadrícula() {
    stroke(255, 7);
    let inicioY = camaraY % 100;
    for (let y = inicioY; y < height; y += 100) {
        line(0, y, width, y);
    }
}

// RENDERIZADO DE MODAL DE FIN DE PARTIDA
function dibujarPantallaFin(titulo, subtitulo, colorTema) {
    fill(0, 0, 0, 210);
    noStroke();
    rect(0, 0, width, height);

    fill(25);
    stroke(colorTema);
    strokeWeight(2);
    rect(width / 2 - 200, height / 2 - 120, 400, 240, 12);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(colorTema);
    textSize(32);
    textStyle(BOLD);
    text(titulo, width / 2, height / 2 - 50);

    fill(210);
    textSize(14);
    textStyle(NORMAL);
    text(subtitulo, width / 2 - 170, height / 2 - 10, 340, 60);

    fill(255, 150);
    textSize(12);
    text("Presiona [ ENTER ] para volver al menú principal", width / 2, height / 2 + 75);
}