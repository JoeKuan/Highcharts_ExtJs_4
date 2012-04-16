<?php
$result[] = array('text' => 'Spline', 'id' => 'charts/spline', 'leaf' => true);
$result[] = array('text' => 'Column', 'id' => 'charts/column', 'leaf' => true);
$result[] = array('text' => 'Pie', 'id' => 'charts/pie', 'leaf' => true);
$result[] = array('text' => 'Scatter', 'id' => 'charts/scatter', 'leaf' => true);
$result[] = array('text' => 'Donut (Pie)', 'id' => 'charts/donut', 'leaf' => true);

echo json_encode($result);
?>
