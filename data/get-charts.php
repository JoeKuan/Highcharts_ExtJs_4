<?php
$result[] = array('text' => 'Spline', 'id' => 'charts/spline', 'leaf' => true, 'icon' => './images/linechart.png');
$result[] = array('text' => 'Column', 'id' => 'charts/column', 'leaf' => true, 'icon' => './images/columnchart.png');
$result[] = array('text' => 'Pie', 'id' => 'charts/pie', 'leaf' => true, 'icon' => './images/piechart.png');
$result[] = array('text' => 'Scatter', 'id' => 'charts/scatter', 'leaf' => true, 'icon' => './images/scatter.png');
$result[] = array('text' => 'Donut (Pie)', 'id' => 'charts/donut', 'leaf' => true, 'icon' => './images/ring.png' );

echo json_encode($result);
?>
