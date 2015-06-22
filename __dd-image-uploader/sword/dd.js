(function(base, w, d) {

    if (typeof base.composer === "undefined") return;

    var speak = base.languages,
        hasFiles = 0,
        accept = {
            'image/bmp': true,
            'image/gif': true,
            'image/jpeg': true,
            'image/jpg': true,
            'image/png': true,
            'image/vnd.microsoft.icon': true
        }, area, progress;

    function upload(files, editor) {
        var data = new FormData(),
            p = progress.children[0],
            file = files[0];
        if (accept[file.type]) {
            data.append('dd_cargo', file);
            drop(file);
            hasFiles++;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('POST', DD_UPLOAD_DESTINATION);
        xhr.onload = function() {
            progress.title = '100%';
            p.style.width = '100%';
        };
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                var up = (e.loaded / e.total * 100 | 0) + '%';
                progress.title = up;
                p.style.width = up;
                p.className = "";
            }
        };
        xhr.onreadystatechange = function() {
            if(this.readyState === 4) {
                var response = JSON.parse(this.responseText);
                // error
                if (!response.url) {
                    w.setTimeout(function() {
                        area.innerHTML = response.message;
                        progress.title = "";
                        progress.style.display = 'none';
                        p.style.width = '0px';
                        p.className = 'error';
                        base.fire('on_dd_upload_error', {
                            'area': area,
                            'progress': progress,
                            'response': response
                        });
                    }, 10);
                // success
                } else {
                    p.className = 'success';
                    var ed = base.composer.grip,
                        s = ed.selection(),
                        clean_B = s.before.replace(/\s+$/, ""),
                        clean_A = s.after.replace(/^\s+/, ""),
                        s_B = clean_B.length > 0 ? '\n\n' : "",
                        clean_V = s_B + (base.is_html_parser_enabled ? '![' + response.name + '](' + response.url + ')' : '<img alt="' + response.name + '" src="' + response.url + '"' + ES) + '\n\n';
                    editor.close(true);
                    base.fire('on_dd_upload_hide', {
                        'area': area,
                        'progress': progress,
                        'response': response
                    });
                    ed.area.value = clean_B + clean_V + clean_A;
                    ed.select(clean_B.length + clean_V.length, function() {
                        ed.updateHistory();
                    });
                    base.fire('on_dd_upload_success', {
                        'area': area,
                        'progress': progress,
                        'response': response
                    });
                }
            }
            hasFiles = 0;
        };
        if (hasFiles) {
            w.setTimeout(function() {
                xhr.send(data);
            }, 3000);
        } else {
            alert(speak.plugin_dd_upload_description_error_disallow);
            base.fire('on_dd_upload_error', {
                'area': area,
                'progress': progress
            });
            hasFiles = 0;
        }
    }

    function drop(file) {
        if (accept[file.type]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var image = new Image();
                image.src = e.target.result;
                image.style.width = '250px';
                image.style.height = 'auto';
                area.innerHTML = "";
                area.appendChild(image);
                progress.style.display = 'block';
                base.fire('on_dd_upload_drop', {
                    'area': area,
                    'progress': progress,
                    'image': image,
                    'reader': reader
                });
            };
            reader.readAsDataURL(file);
        }
    }

    function start(e, editor) {
        editor.modal('dd-upload', function(o, m) {
            m.children[0].innerHTML = speak.plugin_dd_upload_title_title_alt;
            m.children[1].innerHTML = "";
            m.children[2].innerHTML = "";
            area = d.createElement('div');
            progress = d.createElement('span');
            area.className = 'dd-upload-area';
            area.innerHTML = '<span class="dd-upload-area-label">' + speak.plugin_dd_upload_description_drop + '</span>';
            progress.className = 'dd-upload-progress';
            progress.innerHTML = '<span></span>';
            m.children[1].appendChild(area);
            m.children[1].appendChild(progress);
            var cancel = d.createElement('button');
            cancel.innerHTML = speak.MTE.buttons.cancel;
            cancel.onclick = function(e) {
                editor.close(true);
                base.fire('on_dd_upload_hide', {
                    'event': e,
                    'area': area,
                    'progress': progress
                });
            };
            m.children[2].appendChild(cancel);
            area.ondragover = function(e) {
                this.className = 'dd-upload-area hover';
                base.fire('on_dd_upload_event_over', {
                    'event': e
                });
                return false;
            };
            area.ondragend = function(e) {
                this.className = 'dd-upload-area';
                base.fire('on_dd_upload_event_end', {
                    'event': e
                });
                return false;
            };
            area.ondragleave = function(e) {
                this.className = 'dd-upload-area';
                base.fire('on_dd_upload_event_leave', {
                    'event': e
                });
                return false;
            };
            area.ondrop = function(e) {
                this.className = 'dd-upload-area';
                base.fire('on_dd_upload_event_drop', {
                    'event': e
                });
                e.preventDefault();
                upload(e.dataTransfer.files, editor);
            };
        });
        base.fire('on_dd_upload_show', {
            'area': area,
            'progress': progress
        });
    }

    base.composer.button('cloud-upload', {
        title: speak.plugin_dd_upload_title_title,
        click: function(e, editor) {
            start(e, editor);
        }
    });

})(DASHBOARD, window, document);