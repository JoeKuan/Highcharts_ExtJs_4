<?php
  if ( !function_exists('json_encode') ){
    function json_encode($content){
      require_once 'JSON.php';
      $json = new Services_JSON;
      return $json->encodeUnsafe($content);
    }
  }

  session_start();
//unset($_SESSION['temperature']);
  if (!isset($_SESSION['temperature'])) {
    for ($i = 0; $i < 20; $i++) {
      $tm = 1327600670 + (3600 * $i);
      $result['rows'][] = array( 'time' => '' + $tm * 1000, 'yesterday' => rand(20,30), 'today' => rand(15, 25));
    }
    $_SESSION['temperature'] = $result;
  } else {
    $result = $_SESSION['temperature'];
    array_shift($result['rows']);
    $lastTime = intval($result['rows'][18]['time']);
    $result['rows'][] = array( 'time' => '' + ($lastTime + 3600000), 'yesterday' => rand(20,30), 'today' => rand(15, 25));
    $_SESSION['temperature'] = $result;
  }

  $result['success'] = true;
  
    // Return result in summary format
  if (intval($_POST['summary']) == 1) {
    $result['rows'] = array();
    $result['rows'][] = array('time' => 'Today', 'temperature' => rand(15, 25));
    $result['rows'][] = array('time' => 'Yesterday', 'temperature' => rand(20, 30));
    $result['rows'][] = array('time' => '2 days ago', 'temperature' => rand(22, 28));
  }
  
  echo json_encode($result);
?>

