
        import { auth, db } from './firebase-config.js';
        import { onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
        import { doc, getDoc, collection, onSnapshot, query, where, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

        const logout = () => {
            signOut(auth).then(() => { window.location.href = 'index.html'; });
        };
        
        document.getElementById('btn-logout').addEventListener('click', logout);
        document.getElementById('btn-logout-pending').addEventListener('click', logout);

        document.getElementById('btn-change-password').addEventListener('click', () => {
            if (!auth.currentUser || !auth.currentUser.email) return;
            sendPasswordResetEmail(auth, auth.currentUser.email).then(() => {
                alert('Se ha enviado un pergamino a tu correo para restablecer la contraseña.');
            }).catch(e => {
                console.error(e);
                alert('Hubo una perturbación mágica, no se pudo enviar el correo.');
            });
        });

        // Configuración de UI y Audio
        const btnMusic = document.getElementById('btn-music-toggle');
        const bgMusic = document.getElementById('bg-music');
        const iconOn = document.getElementById('icon-music-on');
        const iconOff = document.getElementById('icon-music-off');

        let audioCtx = null;
        let soundEnabled = false;

        function initAudio() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        }

        const playHoverSound = function() {
            if (!soundEnabled || !audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.3);
            } catch(e) {}
        };

        const playClickSound = function() {
            if (!soundEnabled || !audioCtx) return;
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.5);
            } catch(e) {}
        };

        btnMusic.addEventListener('click', () => {
            initAudio();
            if (bgMusic.paused) {
                bgMusic.volume = 0.2;
                bgMusic.play();
                soundEnabled = true;
                iconOff.classList.add('hidden');
                iconOn.classList.remove('hidden');
            } else {
                bgMusic.pause();
                soundEnabled = false;
                iconOn.classList.add('hidden');
                iconOff.classList.remove('hidden');
            }
        });

        // Magical Particles Spawner
        function createParticles() {
            const container = document.body;
            setInterval(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 8 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.animation = `floatMagic ${Math.random() * 5 + 5}s linear forwards`;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 10000);
            }, 500);
        }
        createParticles();

        const modalVisor = document.getElementById('modal-visor');
        const visorTitle = document.getElementById('visor-title');
        const visorContent = document.getElementById('visor-content');
        
        document.getElementById('close-visor').addEventListener('click', () => {
            modalVisor.classList.add('hidden');
            visorContent.innerHTML = ''; // Stop video/iframe
        });

        const getEmbedUrl = (url, type) => {
            if (type === 'youtube') {
                let videoId = '';
                if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                } else if (url.includes('youtube.com/watch')) {
                    try {
                        const urlParams = new URL(url).searchParams;
                        videoId = urlParams.get('v');
                    } catch(e){}
                }
                if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
            }
            if (url.includes('drive.google.com') && url.includes('/view')) {
                return url.replace('/view', '/preview');
            }
            return url;
        };

        window.campusMaterials = {};
        window.currentViewerState = { modId: null, index: 0, items: [] };

        const openViewer = (modId, index) => {
            const items = window.campusMaterials[modId] || [];
            if(items.length === 0) return;
            
            window.currentViewerState = { modId, index, items };
            const mat = items[index];
            
            document.querySelector('#visor-title span').innerText = mat.title;
            visorContent.innerHTML = '<span class="text-gray-500 animate-pulse">Invocando el hechizo...</span>';
            modalVisor.classList.remove('hidden');
            
            const progressPct = ((index + 1) / items.length) * 100;
            document.getElementById('visor-progress').style.width = `${progressPct}%`;
            
            const btnPrev = document.getElementById('btn-visor-prev');
            const btnNext = document.getElementById('btn-visor-next');
            
            if (index > 0) btnPrev.classList.remove('hidden');
            else btnPrev.classList.add('hidden');
            
            if (index < items.length - 1) {
                btnNext.innerHTML = 'Siguiente &rarr;';
            } else {
                btnNext.innerHTML = '¡Completar Módulo! <svg class="w-5 h-5 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
            }

            const disableCtx = 'oncontextmenu="return false;"';
            const embedUrl = getEmbedUrl(mat.url, mat.type);
            const sandboxRules = 'sandbox="allow-scripts allow-same-origin"';
            const isDrive = embedUrl.includes('drive.google.com');
            
            let html = '';
            if (mat.type === 'youtube') {
                html = `<iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen ${sandboxRules} ${disableCtx}></iframe>`;
            } else if (!isDrive && (mat.type === 'image' || (mat.type && mat.type.includes('image')))) {
                html = `<img src="${embedUrl}" ${disableCtx} class="w-full h-full object-contain pointer-events-none" />`;
            } else if (!isDrive && (mat.type && mat.type.includes('video'))) {
                html = `<video controls controlsList="nodownload" ${disableCtx} class="w-full h-full object-contain bg-black" src="${embedUrl}"></video>`;
            } else {
                html = `<iframe src="${embedUrl}" class="w-full h-full bg-white" allow="autoplay" ${sandboxRules} ${disableCtx}></iframe>`;
            }
            visorContent.innerHTML = html;
        };

        document.getElementById('btn-visor-prev').addEventListener('click', () => {
            const st = window.currentViewerState;
            if(st.index > 0) openViewer(st.modId, st.index - 1);
        });

        document.getElementById('btn-visor-next').addEventListener('click', async () => {
            const st = window.currentViewerState;
            if (st.index < st.items.length - 1) {
                // Desbloquear la siguiente lección
                const progressKey = 'progress_' + auth.currentUser.uid + '_' + st.modId;
                const currentUnlocked = parseInt(localStorage.getItem(progressKey) || '0');
                if (st.index + 1 > currentUnlocked) {
                    localStorage.setItem(progressKey, (st.index + 1).toString());
                }
                openViewer(st.modId, st.index + 1);
            } else {
                try {
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    
                    await addDoc(collection(db, "completions"), {
                        studentId: auth.currentUser.uid,
                        studentName: userData.name || "Alumno",
                        moduleId: st.modId,
                        completedAt: new Date(),
                        notified: false
                    });
                    
                    alert("¡Módulo completado! El Gran Maestro ha sido notificado.");
                    document.getElementById('close-visor').click();
                } catch(e) {
                    console.error(e);
                    alert("Módulo completado, pero ocurrió un error al notificar.");
                }
            }
        });

        const chatPanel = document.getElementById('student-chat-panel');
        const chatMessages = document.getElementById('student-chat-messages');
        const chatInput = document.getElementById('student-chat-input');
        
        document.getElementById('btn-floating-chat').addEventListener('click', () => {
            chatPanel.classList.toggle('hidden');
        });
        document.getElementById('btn-header-chat').addEventListener('click', () => {
            chatPanel.classList.toggle('hidden');
        });
        document.getElementById('btn-close-chat').addEventListener('click', () => {
            chatPanel.classList.add('hidden');
        });
        document.getElementById('btn-ask-teacher').addEventListener('click', () => {
            chatPanel.classList.remove('hidden');
        });

        // Chat send
        document.getElementById('btn-student-send').addEventListener('click', async () => {
            const text = chatInput.value.trim();
            if (!text) return;
            
            chatInput.value = '';
            try {
                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                
                let context = '';
                if (!modalVisor.classList.contains('hidden') && window.currentViewerState) {
                    const st = window.currentViewerState;
                    context = st.items[st.index]?.title || "";
                }
                
                await addDoc(collection(db, "messages"), {
                    studentId: auth.currentUser.uid,
                    studentName: userData.name || "Alumno",
                    text: text,
                    sender: 'student',
                    context: context,
                    createdAt: new Date()
                });
            } catch(e) {
                console.error(e);
                alert("Las corrientes mágicas impidieron enviar tu mensaje.");
            }
        });
        
        let chatUnsubscribe = null;
        const loadChat = (uid) => {
            if (chatUnsubscribe) chatUnsubscribe();
            const q = query(collection(db, "messages"), where("studentId", "==", uid));
            chatUnsubscribe = onSnapshot(q, (snapshot) => {
                chatMessages.innerHTML = '';
                if(snapshot.empty) {
                    chatMessages.innerHTML = '<div class="text-xs text-gray-500 text-center mt-10">No hay mensajes. ¡Escribe al Gran Maestro!</div>';
                    return;
                }
                
                let msgs = [];
                snapshot.forEach(docSnap => msgs.push(docSnap.data()));
                msgs.sort((a,b) => {
                    const tA = a.createdAt ? a.createdAt.toMillis() : 0;
                    const tB = b.createdAt ? b.createdAt.toMillis() : 0;
                    return tA - tB;
                });
                
                msgs.forEach(msg => {
                    const isMine = msg.sender === 'student' || msg.question; // Retrocompatibility
                    const text = msg.text || msg.question;
                    const dateObj = msg.createdAt ? msg.createdAt.toDate() : new Date();
                    const time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    
                    const div = document.createElement('div');
                    if (isMine) {
                        div.className = "bg-primary/20 text-sm text-primary p-2 rounded-lg rounded-tr-none max-w-[85%] self-end ml-auto border border-primary/30";
                        div.innerHTML = `${text} <span class="block text-[9px] text-primary/60 mt-1 text-right">${time}</span>`;
                    } else {
                        div.className = "bg-gray-800 text-sm text-gray-200 p-2 rounded-lg rounded-tl-none max-w-[85%] border border-gray-700/50";
                        div.innerHTML = `${text} <span class="block text-[9px] text-gray-500 mt-1 text-right">${time}</span>`;
                    }
                    if(msg.context && isMine) {
                        div.innerHTML = `<span class="block text-[9px] text-primary/80 mb-1 border-b border-primary/20 pb-1">Ref: ${msg.context}</span>` + div.innerHTML;
                    }
                    chatMessages.appendChild(div);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        };

        let currentMaterialsUnsubscribe = null;

        const loadStudentModules = (userAccessibleModules = []) => {
            const container = document.getElementById('student-modules-container');
            const detailsContainer = document.getElementById('module-details-container');
            const materialsContainer = document.getElementById('student-materials-container');
            const btnBack = document.getElementById('btn-back-modules');
            const sectionTitle = document.getElementById('section-title-modules');

            // Handle back button
            btnBack.onclick = () => {
                if (currentMaterialsUnsubscribe) {
                    currentMaterialsUnsubscribe();
                    currentMaterialsUnsubscribe = null;
                }
                detailsContainer.classList.add('hidden');
                container.classList.remove('hidden');
                sectionTitle.textContent = "Grimorios y Módulos";
                // Optionally reload to update unlocked items status
                loadStudentModules(userAccessibleModules); 
            };

            if (userAccessibleModules.length === 0) {
                 container.innerHTML = '<div class="glass p-6 rounded-2xl text-center text-gray-500 col-span-full">Aún no tienes acceso a ningún módulo. Espera a que el maestro te asigne material.</div>';
                 return;
            }

            onSnapshot(collection(db, "modules"), (modulesSnapshot) => {
                if(detailsContainer.classList.contains('hidden') === false) {
                    // Si estamos viendo los detalles, no re-renderizamos el contenedor de modulos
                    return; 
                }

                container.innerHTML = '';
                if(modulesSnapshot.empty) {
                    container.innerHTML = '<div class="glass p-6 rounded-2xl text-center text-gray-500 col-span-full">Aún no hay secretos revelados por el Gran Maestro.</div>';
                    return;
                }
                
                let hasVisibleModules = false;

                let modsArray = [];
                modulesSnapshot.forEach(d => modsArray.push(d));
                modsArray.sort((a,b) => (a.data().order || 0) - (b.data().order || 0));

                modsArray.forEach(modDoc => {
                    const modId = modDoc.id;
                    if (!userAccessibleModules.includes(modId)) return;
                    hasVisibleModules = true;

                    const modData = modDoc.data();
                    
                    const modCard = document.createElement('div');
                    modCard.className = 'glass p-8 rounded-2xl magic-card flex flex-col items-center justify-center text-center cursor-pointer min-h-[250px] relative overflow-hidden group';
                    modCard.innerHTML = `
                        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 text-primary shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-2 text-glow group-hover:text-primary transition-colors">${modData.title}</h3>
                        <p class="text-primary/70 text-sm font-bold uppercase tracking-widest mt-4 flex items-center">
                            Explorar <svg class="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </p>
                    `;
                    
                    modCard.addEventListener('mouseenter', playHoverSound);
                    modCard.addEventListener('click', () => {
                        playClickSound();
                        openModule(modId, modData.title);
                    });
                    
                    container.appendChild(modCard);
                });
                
                if (!hasVisibleModules) {
                    container.innerHTML = '<div class="glass p-6 rounded-2xl text-center text-gray-500 col-span-full">Aún no tienes acceso a ningún módulo. Espera a que el maestro te asigne material.</div>';
                }
            });

            function openModule(modId, modTitle) {
                container.classList.add('hidden');
                detailsContainer.classList.remove('hidden');
                sectionTitle.textContent = "Explorando Grimorio";
                document.getElementById('active-module-title').textContent = modTitle;
                materialsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500 animate-pulse">Invocando hechizos...</div>';

                if (currentMaterialsUnsubscribe) {
                    currentMaterialsUnsubscribe();
                }
                
                const q = query(collection(db, "materials"), where("moduleId", "==", modId));
                currentMaterialsUnsubscribe = onSnapshot(q, (matSnapshot) => {
                    materialsContainer.innerHTML = '';
                    if(matSnapshot.empty) {
                        materialsContainer.innerHTML = '<span class="text-xs text-gray-600 italic col-span-full text-center">Este grimorio aún no tiene hechizos.</span>';
                        return;
                    }
                    
                    window.campusMaterials[modId] = [];
                    let docsArray = [];
                    matSnapshot.forEach(d => docsArray.push(d));
                    docsArray.sort((a,b) => (a.data().order || 0) - (b.data().order || 0));
                    
                    // Tracking unlocking via localStorage
                    const progressKey = 'progress_' + auth.currentUser.uid + '_' + modId;
                    let unlockedIndex = parseInt(localStorage.getItem(progressKey) || '0');
                    
                    docsArray.forEach((matDoc, index) => {
                        const matData = matDoc.data();
                        matData.id = matDoc.id;
                        window.campusMaterials[modId].push(matData);
                        
                        const isUnlocked = index <= unlockedIndex;
                        
                        const matCard = document.createElement('div');
                        matCard.className = `glass p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between ${isUnlocked ? 'magic-card group' : 'opacity-50 grayscale cursor-not-allowed'}`;
                        
                        matCard.innerHTML = `
                            <div>
                                <div class="w-10 h-10 rounded-full ${isUnlocked ? 'bg-primary/20 text-primary group-hover:scale-110' : 'bg-gray-800 text-gray-500'} flex items-center justify-center mb-4 transition-transform shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                    ${isUnlocked ? 
                                        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>' : 
                                        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'}
                                </div>
                                <h4 class="text-lg font-bold text-white mb-2 ${isUnlocked ? 'text-glow' : ''} break-words">${matData.title}</h4>
                            </div>
                            ${isUnlocked ? `
                            <button data-module="${modId}" data-index="${index}" class="btn-view-material mt-4 text-primary text-sm font-bold uppercase tracking-wider flex items-center hover:text-white transition-colors w-fit text-left">
                                Ver Hechizo <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                            ` : `
                            <div class="mt-4 text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center w-fit text-left">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> Bloqueado
                            </div>
                            `}
                        `;
                        materialsContainer.appendChild(matCard);
                    });
                    
                    materialsContainer.querySelectorAll('.btn-view-material').forEach(btn => {
                        btn.addEventListener('mouseenter', playHoverSound);
                        btn.addEventListener('click', (e) => {
                            playClickSound();
                            const mId = e.currentTarget.getAttribute('data-module');
                            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                            openViewer(mId, idx);
                        });
                    });
                });
            }
        };

        const loadStudentExams = (userAccessibleExams = []) => {
            const container = document.getElementById('student-exams-container');
            if (userAccessibleExams.length === 0) {
                container.innerHTML = '<div class="glass p-6 rounded-2xl text-center text-gray-500 col-span-full">Aún no tienes exámenes habilitados.</div>';
                return;
            }
            onSnapshot(collection(db, "exams"), (snapshot) => {
                container.innerHTML = '';
                let examsArray = [];
                snapshot.forEach(d => examsArray.push(d));
                examsArray.sort((a,b) => (a.data().order || 0) - (b.data().order || 0));

                let hasVisibleExams = false;
                examsArray.forEach(examDoc => {
                    if (!userAccessibleExams.includes(examDoc.id)) return;
                    hasVisibleExams = true;
                    
                    const data = examDoc.data();
                    const div = document.createElement('div');
                    div.className = "magic-card bg-gray-800/80 border border-primary/30 p-5 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex flex-col items-center text-center";
                    div.innerHTML = `
                        <svg class="w-10 h-10 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <h4 class="text-white font-bold mb-3">${data.title}</h4>
                        <a href="${data.url}" target="_blank" class="w-full bg-primary hover:bg-yellow-500 text-dark font-bold py-2 px-4 rounded transition-colors text-sm exam-btn">Realizar Examen</a>
                    `;
                    div.addEventListener('mouseenter', playHoverSound);
                    div.addEventListener('click', playClickSound);
                    container.appendChild(div);
                });
                if(!hasVisibleExams) {
                    container.innerHTML = '<div class="glass p-6 rounded-2xl text-center text-gray-500 col-span-full">Aún no tienes exámenes habilitados.</div>';
                }
            });
        };

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    // Use onSnapshot instead of getDoc so permissions update live
                    onSnapshot(docRef, (docSnap) => {
                        document.getElementById('loading').style.display = 'none';

                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            document.getElementById('user-name').innerText = data.name || 'Ilusionista';
                            
                            if (data.status === 'pending') {
                                document.getElementById('pending-overlay').style.display = 'flex';
                                document.getElementById('app-content').classList.add('hidden');
                            } else {
                                // Approved
                                document.getElementById('pending-overlay').style.display = 'none';
                                if (data.role === 'admin') {
                                    // Redirigir admin a su dashboard si entró por error acá
                                    window.location.href = 'dashboard-profe.html';
                                } else {
                                    document.getElementById('app-content').classList.remove('hidden');
                                    loadStudentModules(data.accessibleModules || []);
                                    loadStudentExams(data.accessibleExams || []);
                                    loadChat(user.uid);
                                }
                            }
                        } else {
                            // Usuario sin doc
                            alert("Error: Perfil mágico no encontrado.");
                            logout();
                        }
                    });
                } catch (error) {
                    console.error("Error validando el aura:", error);
                    logout();
                }
            } else {
                window.location.href = 'index.html';
            }
        });


    