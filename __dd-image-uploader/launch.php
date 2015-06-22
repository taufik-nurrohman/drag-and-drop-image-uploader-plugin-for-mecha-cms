<?php

$speak = Config::speak();
$speak_dd = Mecha::A($speak->plugin_dd_upload);

Config::merge('DASHBOARD.languages', array(
    'plugin_dd_upload_title_title' => $speak_dd[0],
    'plugin_dd_upload_title_title_alt' => $speak_dd[1],
    'plugin_dd_upload_description_drop' => $speak_dd[2],
    'plugin_dd_upload_description_error_disallow' => $speak_dd[3]
));

// Begin variable(s)
define('DD_UPLOAD_DESTINATION', $config->url . '/' . $config->manager->slug . '/plugin/' . basename(__DIR__) . '/upload');
define('DD_UPLOAD_TOKEN', Guardian::token());
define('DD_UPLOAD_FOLDER', ASSET);
// End variable(s)

Weapon::add('shell_after', function() {
    echo Asset::stylesheet('cabinet/plugins/' . basename(__DIR__) . '/shell/dd.css');
});

Weapon::add('SHIPMENT_REGION_BOTTOM', function() {
    echo Asset::javascript('cabinet/plugins/' . basename(__DIR__) . '/sword/dd.js');
}, 20);

Route::post(DD_UPLOAD_DESTINATION, function() use($config, $speak) {
    Guardian::checkToken(DD_UPLOAD_TOKEN);
    HTTP::mime('application/json', $config->charset);
    File::upload($_FILES['dd_cargo'], File::path(Request::post('path', DD_UPLOAD_FOLDER)), function($name, $type, $size, $url) {
        echo json_encode(array(
            'name' => $name,
            'type' => $type,
            'size' => $size,
            'url' => $url,
            'message' => Notify::read()
        ));
        exit;
    });
    echo json_encode(array(
        'message' => Notify::read()
    ));
    exit;
});