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
    case "update":
        $result = update_schedule($_GET["data"]);
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

function update_schedule($data){
    global $mysqli;
    
    if (!($stmt = $mysqli->prepare("UPDATE games SET start_time = ?, end_time = ? WHERE id = ?"))) {
        echo "Prepare failed: (" . $mysqli->errno . ")" . $mysqli->error;
        return false;
    }

    foreach ($data as $entry) {
        $stmt->bind_param("sii", $entry["start_time"], $entry["end_time"], $entry["id"]);
    
        if (!$stmt->execute()) {
            echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
            return false;
        }
    }

    $stmt->close();
    return true;
}

echo json_encode($result);
?>