document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // CONFIGURACIÓN DE CLOUDINARY
    // ==========================================
    const myCloudName = 'dx3q1itnr'; 
    const myUploadPreset = 'bautizo_invitados'; 
    const miEtiqueta = 'recuerdos_bautizo'; 

    // Elementos del DOM (Subida y Modales)
    const fileSelector = document.getElementById('file_selector');
    const btnSeleccionar = document.getElementById('btn_seleccionar_archivos');
    const btnSubirPrincipal = document.getElementById('btn_confirmar_subida');
    const previewContainer = document.getElementById('preview_container');
    const btnDiscardAll = document.getElementById('btn_discard');
    
    const modalUpload = document.getElementById('fullscreen_modal');
    const modalImageUpload = document.getElementById('modal_image');
    const modalVideoUpload = document.getElementById('modal_video');
    const modalCounterUpload = document.getElementById('modal_counter');
    const modalCloseUpload = document.getElementById('modal_close');
    const modalDiscardSingle = document.getElementById('modal_discard_single');
    const modalPrevUpload = document.getElementById('modal_prev');
    const modalNextUpload = document.getElementById('modal_next');
    const modalSwipeAreaUpload = document.getElementById('modal_swipe_area');
    const swipeHintOverlay = document.getElementById('swipe_hint_overlay');
    const modalUploadBtn = document.getElementById('modal_upload_btn');

    const uploadOverlay = document.getElementById('upload_overlay');
    const uploadStatusText = document.getElementById('upload_status_text');
    const uploadProgressBar = document.getElementById('upload_progress_bar');
    const progressContainer = document.getElementById('progress_container');
    const uploadSuccessIcon = document.getElementById('upload_success_icon');

    const btnAbrirAlbum = document.getElementById('btn_abrir_album');
    const albumModal = document.getElementById('album_modal');
    const btnCerrarAlbum = document.getElementById('btn_cerrar_album');
    const albumGrid = document.getElementById('album_grid');
    const btnDescargarTodoAlbum = document.getElementById('btn_descargar_todo_album');

    const viewerModal = document.getElementById('viewer_modal');
    const viewerImage = document.getElementById('viewer_image');
    const viewerVideo = document.getElementById('viewer_video');
    const viewerCounter = document.getElementById('viewer_counter');
    const btnCerrarViewer = document.getElementById('btn_cerrar_viewer');
    const viewerPrev = document.getElementById('viewer_prev');
    const viewerNext = document.getElementById('viewer_next');
    const viewerSwipeArea = document.getElementById('viewer_swipe_area');
    const btnDescargarActual = document.getElementById('btn_descargar_actual');

    let archivosSeleccionados = []; 
    let indexUpload = 0; 
    let galeriaMedia = []; 
    let indexViewer = 0;   

    // ==========================================
    // 1. INICIALIZAR CARRUSEL DE CLOUDINARY
    // ==========================================
    const myGallery = cloudinary.galleryWidget({
        container: "#mi_galeria_carrusel",
        cloudName: myCloudName,
        mediaAssets: [
            { tag: miEtiqueta, mediaType: "image" }, 
            { tag: miEtiqueta, mediaType: "video" }  
        ],
        displayProps: { mode: "classic", spacing: 15 },
        aspectRatio: "16:9", carouselLocation: "bottom", carouselStyle: "thumbnails", zoom: true,
        videoProps: { playerType: "cloudinary", controls: false, muted: false, autoplay: false }
    });
    myGallery.render();

    // ==========================================
    // 2. LÓGICA DEL ÁLBUM Y VISOR DETALLADO
    // ==========================================
    btnAbrirAlbum.addEventListener('click', async () => {
        albumModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; 
        albumGrid.innerHTML = '<h3 style="color: var(--dark-pink);">Cargando recuerdos... ⏳</h3>';
        galeriaMedia = []; const cacheBuster = Date.now(); 

        try {
            const resImg = await fetch(`https://res.cloudinary.com/${myCloudName}/image/list/${miEtiqueta}.json?t=${cacheBuster}`);
            if (resImg.ok) {
                const dataImg = await resImg.json();
                dataImg.resources.forEach(r => {
                    galeriaMedia.push({ type: 'image', thumbUrl: `https://res.cloudinary.com/${myCloudName}/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v${r.version}/${r.public_id}.${r.format}`, viewUrl: `https://res.cloudinary.com/${myCloudName}/image/upload/q_auto,f_auto/v${r.version}/${r.public_id}.${r.format}`, downloadUrl: `https://res.cloudinary.com/${myCloudName}/image/upload/fl_attachment/v${r.version}/${r.public_id}.${r.format}` });
                });
            }
        } catch(e) {}

        try {
            const resVid = await fetch(`https://res.cloudinary.com/${myCloudName}/video/list/${miEtiqueta}.json?t=${cacheBuster}`);
            if (resVid.ok) {
                const dataVid = await resVid.json();
                dataVid.resources.forEach(r => {
                    galeriaMedia.push({ type: 'video', thumbUrl: `https://res.cloudinary.com/${myCloudName}/video/upload/w_300,h_300,c_fill,q_auto,f_auto/v${r.version}/${r.public_id}.jpg`, viewUrl: `https://res.cloudinary.com/${myCloudName}/video/upload/q_auto,f_auto/v${r.version}/${r.public_id}.${r.format}`, downloadUrl: `https://res.cloudinary.com/${myCloudName}/video/upload/fl_attachment/v${r.version}/${r.public_id}.${r.format}` });
                });
            }
        } catch(e) {}

        if (galeriaMedia.length === 0) { albumGrid.innerHTML = '<p style="color: #666;">Aún no hay recuerdos compartidos. ¡Sé el primero en subir uno!</p>'; } else {
            let html = '';
            galeriaMedia.forEach((media, i) => {
                html += `<div class="download-card" style="cursor: pointer;" onclick="window.abrirVisorDetalle(${i})">
                    ${media.type === 'video' ? '<div class="video-indicator">🎥</div>' : ''}
                    <img src="${media.thumbUrl}" alt="Media">
                    <button onclick="event.stopPropagation(); window.descargarLink('${media.downloadUrl}')" class="btn-download-small" style="width: 100%; border: none; cursor: pointer;">⬇️ Descargar</button>
                </div>`;
            });
            albumGrid.innerHTML = html;
        }
    });

    btnCerrarAlbum.addEventListener('click', () => { albumModal.style.display = 'none'; document.body.style.overflow = 'auto'; });
    window.descargarLink = (url) => { const a = document.createElement('a'); a.href = url; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
    window.abrirVisorDetalle = (index) => { indexViewer = index; actualizarVisor(); viewerModal.style.display = 'flex'; };

    const actualizarVisor = () => {
        if(galeriaMedia.length === 0) return; const media = galeriaMedia[indexViewer]; viewerCounter.innerText = `${indexViewer + 1} / ${galeriaMedia.length}`;
        viewerVideo.pause();
        if (media.type === 'image') { viewerImage.src = media.viewUrl; viewerImage.style.display = 'block'; viewerVideo.style.display = 'none'; } else { viewerImage.style.display = 'none'; viewerVideo.src = media.viewUrl; viewerVideo.style.display = 'block'; }
        viewerPrev.style.visibility = indexViewer === 0 ? 'hidden' : 'visible'; viewerNext.style.visibility = indexViewer === galeriaMedia.length - 1 ? 'hidden' : 'visible';
    };

    btnCerrarViewer.addEventListener('click', () => { viewerVideo.pause(); viewerVideo.src = ''; viewerImage.src = ''; viewerModal.style.display = 'none'; });
    viewerPrev.addEventListener('click', () => { if(indexViewer > 0) { indexViewer--; actualizarVisor(); }}); viewerNext.addEventListener('click', () => { if(indexViewer < galeriaMedia.length - 1) { indexViewer++; actualizarVisor(); }});

    let touchStartVisorX = 0; let touchEndVisorX = 0;
    viewerSwipeArea.addEventListener('touchstart', e => { touchStartVisorX = e.changedTouches[0].screenX; }, { passive: true });
    viewerSwipeArea.addEventListener('touchend', e => {
        touchEndVisorX = e.changedTouches[0].screenX;
        if (touchEndVisorX < touchStartVisorX - 50 && indexViewer < galeriaMedia.length - 1) { indexViewer++; actualizarVisor(); }
        if (touchEndVisorX > touchStartVisorX + 50 && indexViewer > 0) { indexViewer--; actualizarVisor(); }
    });

    btnDescargarActual.addEventListener('click', () => { const media = galeriaMedia[indexViewer]; window.descargarLink(media.downloadUrl); });

    btnDescargarTodoAlbum.addEventListener('click', async () => {
        if(galeriaMedia.length === 0) { alert("No hay archivos para descargar."); return; }
        btnDescargarTodoAlbum.innerText = "Preparando Álbum... ⏳"; btnDescargarTodoAlbum.disabled = true;
        try {
            const zip = new JSZip(); let completados = 0;
            for (let i = 0; i < galeriaMedia.length; i++) {
                const media = galeriaMedia[i]; const extension = media.viewUrl.split('.').pop(); const nombreArchivo = `Recuerdo_${i + 1}.${extension}`;
                const respuesta = await fetch(media.viewUrl); const blob = await respuesta.blob(); zip.file(nombreArchivo, blob);
                completados++; const porcentaje = Math.round((completados / galeriaMedia.length) * 100); btnDescargarTodoAlbum.innerText = `Empaquetando... ⏳ (${porcentaje}%)`;
            }
            btnDescargarTodoAlbum.innerText = "Generando archivo ZIP... 📦";
            const contenidoZip = await zip.generateAsync({ type: "blob" });
            saveAs(contenidoZip, "Recuerdos_Bautizo_Aisha.zip"); btnDescargarTodoAlbum.innerText = "¡Descarga completada! ✅";
        } catch (error) { alert("Hubo un problema de conexión. Intenta descargar las fotos una por una."); btnDescargarTodoAlbum.innerText = "Descargar Todo el Álbum 📥"; }
        setTimeout(() => { btnDescargarTodoAlbum.innerText = "Descargar Todo el Álbum 📥"; btnDescargarTodoAlbum.disabled = false; }, 3000);
    });

    // ==========================================
    // 3. LÓGICA DE SUBIDA
    // ==========================================
    btnSeleccionar.addEventListener('click', () => { fileSelector.click(); });

    const limpiarFormularioSubida = () => {
        archivosSeleccionados = []; fileSelector.value = ''; btnSubirPrincipal.style.display = 'none'; btnDiscardAll.style.display = 'none'; previewContainer.style.display = 'none'; previewContainer.innerHTML = ''; document.getElementById('preview_wrapper').style.display = 'none'; btnSeleccionar.style.display = 'inline-block'; modalDiscardSingle.style.display = 'block'; modalCloseUpload.style.display = 'block';
        modalUpload.style.display = 'none'; modalImageUpload.src = ''; 
        if(modalVideoUpload.tagName === 'VIDEO') { modalVideoUpload.pause(); modalVideoUpload.src = ''; }
        document.body.style.overflow = 'auto'; swipeHintOverlay.classList.remove('is-visible');
    };

    const renderizarMiniaturasSubida = () => {
        previewContainer.innerHTML = ''; if (archivosSeleccionados.length === 0) { limpiarFormularioSubida(); return; }
        document.getElementById('preview_wrapper').style.display = 'inline-block'; previewContainer.style.display = 'flex'; btnDiscardAll.style.display = 'block'; btnSubirPrincipal.style.display = 'inline-block'; btnSeleccionar.style.display = 'none'; 

        archivosSeleccionados.forEach((file, idx) => {
            const wrapper = document.createElement('div'); wrapper.style.position = 'relative'; wrapper.style.display = 'inline-block'; wrapper.style.cursor = 'pointer'; 
            wrapper.addEventListener('click', (e) => { if(e.target.tagName.toLowerCase() !== 'button') abrirModalSubida(idx); });

            const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
            const isVideo = file.type.startsWith('video/');

            if (isVideo) {
                const vid = document.createElement('video'); vid.src = URL.createObjectURL(file); vid.style.width = '80px'; vid.style.height = '80px'; vid.style.objectFit = 'cover'; vid.style.borderRadius = '8px'; vid.style.border = '2px solid var(--gold)'; vid.muted = true; vid.preload = 'metadata';
                const icon = document.createElement('div'); icon.innerText = '🎥'; icon.style.position = 'absolute'; icon.style.bottom = '4px'; icon.style.left = '4px'; icon.style.fontSize = '12px'; icon.style.background = 'rgba(0,0,0,0.6)'; icon.style.color = 'white'; icon.style.padding = '2px 5px'; icon.style.borderRadius = '4px';
                wrapper.appendChild(vid); wrapper.appendChild(icon);
            } else {
                const img = document.createElement('img'); img.style.width = '80px'; img.style.height = '80px'; img.style.objectFit = 'cover'; img.style.borderRadius = '8px'; img.style.border = '2px solid var(--gold)';
                if (isHeic) {
                    img.src = 'https://via.placeholder.com/80/FFC0CB/db7093?text=⏳'; 
                    if (typeof heic2any !== 'undefined') {
                        heic2any({ blob: file, toType: "image/jpeg", quality: 0.2 }).then(res => { img.src = URL.createObjectURL(res); }).catch(() => { img.src = 'https://via.placeholder.com/80/FFC0CB/db7093?text=HEIC'; });
                    }
                } else { img.src = URL.createObjectURL(file); }
                wrapper.appendChild(img);
            }

            const btnX = document.createElement('button'); btnX.innerText = '×'; btnX.style.position = 'absolute'; btnX.style.top = '-6px'; btnX.style.right = '-6px'; btnX.style.background = '#ff4d4d'; btnX.style.color = 'white'; btnX.style.border = 'none'; btnX.style.borderRadius = '50%'; btnX.style.width = '20px'; btnX.style.height = '20px'; btnX.style.cursor = 'pointer'; btnX.style.fontWeight = 'bold'; btnX.style.lineHeight = '1';
            btnX.addEventListener('click', () => { archivosSeleccionados.splice(idx, 1); renderizarMiniaturasSubida(); }); wrapper.appendChild(btnX); previewContainer.appendChild(wrapper);
        });
    };

    const actualizarVistaModalSubida = () => {
        if(archivosSeleccionados.length === 0) return; const file = archivosSeleccionados[indexUpload]; modalCounterUpload.innerText = `${indexUpload + 1} / ${archivosSeleccionados.length}`;
        const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
        const isVideo = file.type.startsWith('video/');

        if (modalVideoUpload.tagName === 'VIDEO') modalVideoUpload.pause(); 

        if (isVideo) { 
            modalImageUpload.style.display = 'none'; modalVideoUpload.src = URL.createObjectURL(file); modalVideoUpload.style.display = 'block'; 
        } else { 
            modalVideoUpload.style.display = 'none'; modalImageUpload.style.display = 'block'; 
            if (isHeic) {
                modalImageUpload.src = 'https://via.placeholder.com/400x400/FFC0CB/db7093?text=Cargando...';
                if (typeof heic2any !== 'undefined') {
                    heic2any({ blob: file, toType: "image/jpeg", quality: 0.5 }).then(res => { modalImageUpload.src = URL.createObjectURL(res); }).catch(() => { modalImageUpload.src = 'https://via.placeholder.com/400x400/FFC0CB/db7093?text=HEIC'; });
                }
            } else { modalImageUpload.src = URL.createObjectURL(file); }
        }
        modalPrevUpload.style.visibility = indexUpload === 0 ? 'hidden' : 'visible'; modalNextUpload.style.visibility = indexUpload === archivosSeleccionados.length - 1 ? 'hidden' : 'visible';
    };

    const abrirModalSubida = (idx = 0) => { indexUpload = idx; actualizarVistaModalSubida(); modalUpload.style.display = 'flex'; document.body.style.overflow = 'hidden'; if (archivosSeleccionados.length > 1) { setTimeout(() => { swipeHintOverlay.classList.add('is-visible'); }, 100); } };
    
    modalCloseUpload.addEventListener('click', () => { modalUpload.style.display = 'none'; modalImageUpload.src = ''; if(modalVideoUpload.tagName === 'VIDEO') { modalVideoUpload.pause(); modalVideoUpload.src = ''; } document.body.style.overflow = 'auto'; swipeHintOverlay.classList.remove('is-visible'); });
    modalPrevUpload.addEventListener('click', () => { if(indexUpload > 0) { indexUpload--; actualizarVistaModalSubida(); } swipeHintOverlay.classList.remove('is-visible'); });
    modalNextUpload.addEventListener('click', () => { if(indexUpload < archivosSeleccionados.length - 1) { indexUpload++; actualizarVistaModalSubida(); } swipeHintOverlay.classList.remove('is-visible'); });

    let touchStartUpX = 0; let touchEndUpX = 0;
    modalSwipeAreaUpload.addEventListener('touchstart', e => { touchStartUpX = e.changedTouches[0].screenX; swipeHintOverlay.classList.remove('is-visible'); }, { passive: true });
    modalSwipeAreaUpload.addEventListener('touchend', e => {
        touchEndUpX = e.changedTouches[0].screenX;
        if (touchEndUpX < touchStartUpX - 50 && indexUpload < archivosSeleccionados.length - 1) { indexUpload++; actualizarVistaModalSubida(); }
        if (touchEndUpX > touchStartUpX + 50 && indexUpload > 0) { indexUpload--; actualizarVistaModalSubida(); }
    });

    modalDiscardSingle.addEventListener('click', () => { archivosSeleccionados.splice(indexUpload, 1); renderizarMiniaturasSubida(); if (archivosSeleccionados.length === 0) { modalCloseUpload.click(); } else { if (indexUpload >= archivosSeleccionados.length) indexUpload = archivosSeleccionados.length - 1; actualizarVistaModalSubida(); } });
    fileSelector.addEventListener('change', () => { if (fileSelector.files.length > 0) { archivosSeleccionados = Array.from(fileSelector.files); renderizarMiniaturasSubida(); abrirModalSubida(0); } else limpiarFormularioSubida(); });
    btnDiscardAll.addEventListener('click', limpiarFormularioSubida);

    const subirArchivoConProgreso = (file, fileIndex, totalFiles) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', myUploadPreset); formData.append('tags', miEtiqueta); 
            const xhr = new XMLHttpRequest(); xhr.open('POST', `https://api.cloudinary.com/v1_1/${myCloudName}/auto/upload`);
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100); const overallProgress = ((fileIndex + (percentComplete / 100)) / totalFiles) * 100;
                    uploadProgressBar.style.width = `${overallProgress}%`; uploadStatusText.innerText = `Subiendo ${fileIndex + 1} de ${totalFiles}... (${percentComplete}%)`;
                }
            });
            xhr.onload = () => { if (xhr.status === 200) resolve(true); else reject(false); }; xhr.onerror = () => reject(false); xhr.send(formData);
        });
    };

    const procesarSubida = async () => {
        if (archivosSeleccionados.length === 0) return;
        uploadOverlay.style.display = 'flex'; progressContainer.style.display = 'block'; uploadSuccessIcon.style.display = 'none'; uploadStatusText.style.color = 'white'; uploadProgressBar.style.width = '0%'; uploadStatusText.innerText = 'Iniciando subida...';
        let subidasExitosas = 0;
        for (let i = 0; i < archivosSeleccionados.length; i++) {
            try { const exito = await subirArchivoConProgreso(archivosSeleccionados[i], i, archivosSeleccionados.length); if (exito) subidasExitosas++; } catch (error) { console.error(`Error en el archivo ${i + 1}`); }
        }
        progressContainer.style.display = 'none'; 
        if (subidasExitosas === archivosSeleccionados.length) {
            uploadSuccessIcon.style.display = 'block'; uploadStatusText.innerText = '¡Recuerdos compartidos con éxito!'; uploadStatusText.style.color = '#4CAF50'; 
            myGallery.render(); 
        } else {
            uploadStatusText.innerText = `Se subieron ${subidasExitosas} de ${archivosSeleccionados.length} archivos. Hubo un error de red.`; uploadStatusText.style.color = '#ff4d4d'; 
        }
        setTimeout(() => { uploadOverlay.style.display = 'none'; limpiarFormularioSubida(); }, 2500); 
    };

    btnSubirPrincipal.addEventListener('click', procesarSubida);
    modalUploadBtn.addEventListener('click', procesarSubida);

    // ==========================================
    // 4. LÓGICA DEL MURO DE DESEOS (FIREBASE SEGURO)
    // ==========================================
    
    // 🔥 IMPORTANTE: ¡REEMPLAZA ESTO CON TUS DATOS DE FIREBASE! 🔥
    const firebaseConfig = {
        apiKey: "AIzaSyB_itehtXXSYhsJOhA_fvVPg2MQvuz4QJM",
        authDomain: "bautizo-aisha.firebaseapp.com",
        databaseURL: "https://bautizo-aisha-default-rtdb.firebaseio.com",
        projectId: "bautizo-aisha",
        storageBucket: "bautizo-aisha.firebasestorage.app",
        messagingSenderId: "77658332123",
        appId: "1:77658332123:web:8eb0824dc3c391278a25fe"
    };

    // Inicializamos Firebase de forma segura (solo una vez)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    const deseosRef = database.ref('muro_deseos_bautizo');

    const wishNameInput = document.getElementById('wish_name');
    const wishMessageInput = document.getElementById('wish_message');
    const btnEnviarDeseo = document.getElementById('btn_enviar_deseo');
    const wishesWall = document.getElementById('wishes_wall');

    // Función ÚNICA para dibujar en pantalla
    const agregarDeseoAlDOM = (nombre, mensaje) => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `
            <p class="wish-text">"${mensaje}"</p>
            <p class="wish-author">- ${nombre}</p>
        `;
        wishesWall.prepend(card); 
    };

    // Limpiamos el muro antes de que Firebase empiece a dibujar para evitar mensajes dobles
    wishesWall.innerHTML = ''; 

    // FIREBASE ESCUCHA Y DIBUJA (Apagamos cualquier escucha previa por seguridad)
    deseosRef.off();
    deseosRef.on('child_added', (snapshot) => {
        const datos = snapshot.val();
        if(datos && datos.nombre && datos.mensaje) {
            agregarDeseoAlDOM(datos.nombre, datos.mensaje);
        }
    });

    // Usamos onclick (en lugar de addEventListener) para asegurar que el evento no se duplique
    btnEnviarDeseo.onclick = () => {
        const nombre = wishNameInput.value.trim();
        const mensaje = wishMessageInput.value.trim();

        if (!nombre || !mensaje) {
            alert("Por favor, escribe tu nombre y un mensaje antes de publicar.");
            return;
        }

        btnEnviarDeseo.innerText = "Publicando... ⏳";
        btnEnviarDeseo.disabled = true;

        // SEGURO ANTI-ATASCOS: Si Firebase falla por falta de internet, soltamos el botón en 10 seg
        const temporizadorDeSeguridad = setTimeout(() => {
            btnEnviarDeseo.innerText = "Error de red. Reintenta ❌";
            btnEnviarDeseo.style.backgroundColor = "#ff4d4d";
            setTimeout(() => {
                btnEnviarDeseo.innerText = "Publicar Deseo 💌";
                btnEnviarDeseo.style.backgroundColor = "var(--gold)";
                btnEnviarDeseo.disabled = false;
            }, 3000);
        }, 10000);

        // Enviamos el mensaje a la base de datos
        deseosRef.push({
            nombre: nombre,
            mensaje: mensaje,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            clearTimeout(temporizadorDeSeguridad); // Todo salió bien, cancelamos el error
            
            wishNameInput.value = '';
            wishMessageInput.value = '';
            
            btnEnviarDeseo.innerText = "¡Deseo Publicado! ✨";
            btnEnviarDeseo.style.backgroundColor = "#4CAF50"; 
            
            setTimeout(() => { 
                btnEnviarDeseo.innerText = "Publicar Deseo 💌"; 
                btnEnviarDeseo.style.backgroundColor = "var(--gold)";
                btnEnviarDeseo.disabled = false;
            }, 3000);
        }).catch((error) => {
            clearTimeout(temporizadorDeSeguridad);
            console.error("Error guardando el deseo: ", error);
            alert("Verifica que hayas puesto correctamente tus credenciales de Firebase en el código.");
            btnEnviarDeseo.innerText = "Publicar Deseo 💌";
            btnEnviarDeseo.disabled = false;
        });
    };
});