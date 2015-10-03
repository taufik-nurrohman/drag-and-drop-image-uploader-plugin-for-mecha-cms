(function(w, d, base) {

    if (!base.composer) return;

    var mte = base.languages.MTE,
        speak = mte.plugin_dd_upload,
        ok = false,
        hook = 'on_dd_upload_',
        label = '<label class="dd-upload-area-label">%s<input type="file"></label>',
        btn_name = 'cloud-upload plugin-dd-image-uploader',
        accept = {
            'image/bmp': true,
            'image/gif': true,
            'image/jpeg': true,
            'image/jpg': true,
            'image/png': true,
            'image/vnd.microsoft.icon': true
        }, area, progress;

    // image preview
    function drop(file, sm) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var image = new Image();
            image.src = e.target.result;
            image.className = sm ? 'img-small' : 'img-large';
            area.appendChild(image);
            progress.style.display = 'block';
            base.fire(hook + 'drop', {
                'area': area,
                'progress': progress,
                'image': image,
                'reader': reader
            });
        };
        reader.readAsDataURL(file);
    }

    // image upload
    function upload(files, editor) {
        var data = new FormData(),
            p = progress.children[0],
            len = files.length;
        area.innerHTML = "";
        for (var i = 0; i < len; ++i) {
            ok = false;
            if (accept[files[i].type]) {
                data.append('dd_cargo_' + i, files[i]);
                drop(files[i], len > 1);
                ok = true;
            }
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
                var response = JSON.parse(this.responseText),
                    output = [];
                for (var i = 0, len = response.length; i < len; ++i) {
                    var url = response[i],
                        name = base.task.file.B(url),
                        plain = '![' + name + '](' + url + ')',
                        html = '<img alt="' + name + '" src="' + url + '"' + ES;
                    output.push(base.is_html_parser_enabled ? plain : html);
                }
                // insert!
                editor.tidy('\n\n', function() {
                    editor.insert(output.join('\n\n'), function() {
                        var s = editor.selection();
                        if (!s.after.length) {
                            editor.area.value += '\n\n';
                        }
                        editor.select(s.end + 2, function() {
                            editor.updateHistory();
                        });
                    });
                }, '\n\n', true);
                base.fire(hook + 'success', {
                    'area': area,
                    'progress': progress,
                    'response': response
                });
                ok = false;
            }
        };
        if (ok) {
            w.setTimeout(function() {
                xhr.send(data);
                ok = false;
            }, 3000);
        } else {
            base.composer.alert(speak[1], speak[3], function() {
                base.composer.grip.config.buttons[btn_name].click(false, base.composer);
            });
            base.fire(hook + 'error', {
                'area': area,
                'progress': progress
            });
        }
    }

    // show modal
    function start(e, editor) {
        editor.modal('dd-upload', function(overlay, modal, header, content, footer) {
            header.innerHTML = speak[1];
            content.innerHTML = "";
            footer.innerHTML = "";
            area = d.createElement('div');
            progress = d.createElement('span');
            area.className = 'dd-upload-area';
            area.innerHTML = label.replace('%s', speak[2]);
            progress.className = 'dd-upload-progress';
            progress.innerHTML = '<span></span>';
            content.appendChild(area);
            content.appendChild(progress);
            var cancel = d.createElement('button');
            cancel.innerHTML = mte.buttons.cancel;
            cancel.onclick = function(e) {
                editor.close(true);
                base.fire(hook + 'hide', {
                    'event': e,
                    'area': area,
                    'progress': progress
                });
            };
            footer.appendChild(cancel);
            area.ondragover = function(e) {
                this.className = 'dd-upload-area hover';
                base.fire(hook + 'event_over', {
                    'event': e
                });
                return false;
            };
            area.ondragend = function(e) {
                this.className = 'dd-upload-area';
                base.fire(hook + 'event_end', {
                    'event': e
                });
                return false;
            };
            area.ondragleave = function(e) {
                this.className = 'dd-upload-area';
                base.fire(hook + 'event_leave', {
                    'event': e
                });
                return false;
            };
            // drop ...
            area.ondrop = function(e) {
                this.className = 'dd-upload-area';
                base.fire(hook + 'event_drop', {
                    'event': e
                });
                e.preventDefault();
                upload(e.dataTransfer.files, editor.grip);
            };
            // browse ...
            var file = area.getElementsByTagName('input')[0];
            file.onchange = function(e) {
                base.fire(hook + 'event_drop', {
                    'event': e
                });
                upload(this.files, editor.grip);
            };
        });
        base.fire(hook + 'show', {
            'area': area,
            'progress': progress
        });
    }

    // add button
    base.composer.button(btn_name, {
        title: speak[0],
        click: start
    });

    // add keyboard shortcut
    base.composer.shortcut('CTRL+SHIFT+71', function() {
        return base.composer.grip.config.buttons[btn_name].click(false, base.composer), false;
    });

})(window, document, DASHBOARD);