function abrirImagen(src){
    document.getElementById("visorImagen").style.display="flex";
    document.getElementById("imagenGrande").src=src;
}

function cerrarImagen(){
    document.getElementById("visorImagen").style.display="none";
}