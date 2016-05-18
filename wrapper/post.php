<?php
	$context = stream_context_create(array(
		'http' => array(
			'header'  => "Authorization: Bearer " . $_REQUEST['token']
		)
	));
	
	header('Content-Type: application/json');
	
	header('Access-Control-Allow-Origin: *');
	
	echo file_get_contents('https://api.producthunt.com/v1/posts/'.$_REQUEST['id'], false, $context);
