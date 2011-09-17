<?php 

  if (array_key_exists('screenName', $_GET)) {

    require 'API_cache.php';

    $cache_file = 'cache_files/' . 
      preg_replace('/[^\w\d-]/', '', $_GET['screenName']) . '.json';
    $api_call = 'http://api.twitter.com/1/statuses/user_timeline.json?';
    $api_call .= 'screen_name=' . $_GET['screenName'] . '&';
    $api_call .= 'count=' . $_GET['resultsPerCache'] . '&';
    $api_call .= 'include_rts=' . (int)$_GET['showRetweets'];
    $cache_for = 5; // cache results for five minutes

    $api_cache = new API_cache ($api_call, $cache_for, $cache_file);
    if (!$res = $api_cache->get_api_cache())
      $res = '{"error": "Could not load cache"}';

    ob_start();
    echo $res;
    $json_body = ob_get_clean();

    header ('Content-Type: application/json');
    header ('Content-length: ' . strlen($json_body));
    header ("Expires: " . $api_cache->get_expires_datetime());
    echo $json_body;

  }
