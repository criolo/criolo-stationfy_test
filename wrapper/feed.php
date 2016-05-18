<?php
	header('Content-Type: application/json');
	
	header('Access-Control-Allow-Origin: *');

	$query = sizeof($_REQUEST) > 0 ? '?' : '';

	$output = 'https://posts.producthunt.com/posts/currentUser'.$query;

	foreach($_REQUEST as $key => $val){
		$output .= $key.'='.urlencode($val).'&';
	}
	
	$output = substr($output, 0, -1);

	echo file_get_contents($output);