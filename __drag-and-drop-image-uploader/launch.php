<?php

// Begin variable(s)
$img_def = '<img alt="%2$s" src="%1$s"' . ES;
define('DD_UPLOAD_OUTPUT', Mecha::alter($config->html_parser->active, array(
    'HTML' => $img_def,
    'Markdown' => '![%2$s](%1$s)'
), $img_def));
define('DD_UPLOAD_WORKER', $config->url . '/' . $config->manager->slug . '/' . File::B(__DIR__) . '/upload');
define('DD_UPLOAD_TOKEN', Guardian::token());
define('DD_UPLOAD_FOLDER', ASSET . DS . 'object');
// End variable(s)

Config::merge('DASHBOARD.languages.MTE.plugin_dd_upload', $speak->plugin_dd_upload);

$f = ltrim(File::B(__DIR__), '_') . '.min.';

Weapon::add('shell_after', function() use($f) {
    echo Asset::stylesheet(__DIR__ . DS . 'assets' . DS . 'shell' . DS . 'button.css', "", 'shell/' . $f . 'css');
}, 20);

Weapon::add('SHIPMENT_REGION_BOTTOM', function() use($f) {
    echo Asset::javascript(__DIR__ . DS . 'assets' . DS . 'sword' . DS . 'button.js', "", 'sword/editor.button.' . $f . 'js');
}, 20);

Route::post(DD_UPLOAD_WORKER, function() use($config, $speak) {
    Guardian::checkToken(DD_UPLOAD_TOKEN);
    HTTP::mime('application/json', $config->charset);
    $results = array();
    foreach($_FILES as $file) {
        $path = DD_UPLOAD_FOLDER . DS . Text::parse($file['name'], '->safe_file_name');
        $results[] = File::url($path);
        File::upload($file, File::path(Request::post('dd_upload_path', DD_UPLOAD_FOLDER)));
    }
    Notify::clear(); // hide error messages
    echo json_encode($results);
    exit;
});