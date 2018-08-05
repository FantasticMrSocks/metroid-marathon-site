<?php
header('Content-Type: application/json');

include("../../../../dbinfo.php");
$mysqli = new mysqli("localhost", $user, $password, "marathon");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

switch ($_GET["fn"]) {
    case "get":
        $result = get_table($_GET["tbl"]);
        break;
}

function get_table($table) {
    global $mysqli;

    if (!($stmt = $mysqli->prepare("SELECT * FROM " . $table))) {
        echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }
    
    if (!$stmt->execute()) {
        echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
    }
    
    $res = $stmt->get_result();
    $stmt->close();
    return $res->fetch_all(MYSQLI_ASSOC);
}

echo json_encode($result);
?>