<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
if(isset($_POST['email'])) {

		echo "<script>console.log('".$_POST."');</script>";

    // EDIT THE 2 LINES BELOW AS REQUIRED
    $email_to = "info@catchbitcoin.io";
    $email_subject = "Пользователь заполнил форму на сайте";
    $email_client_subject = "Вы заполнили форму на сайте Catch Bitcoin";

    function died($error) {
        // your error code can go here
        echo "We are very sorry, but there were error(s) found with the form you submitted. ";
        echo "These errors appear below.<br /><br />";
        echo $error."<br /><br />";
        echo "Please go back and fix these errors.<br /><br />";
        die();
    }

    $name = $_POST['name']; // required
    $email_from = $_POST['email']; // required
    $country_code = $_POST['code']; // auto
    $telephone = $_POST['phone']; // not required

    $email_message = "Данные, которые оставил пользователь.\n\n";
    $email_client_message = "Данные, которые вы указали.\n\n";

    function clean_string($string) {
      $bad = array("content-type","bcc:","to:","cc:","href");
      return str_replace($bad,"",$string);
    }

    $email_message .= "Имя: ".clean_string($name)."\n";
    $email_message .= "Email: ".clean_string($email_from)."\n";
    $email_message .= "Телефон: ".clean_string($country_code)." ".clean_string($telephone)."\n";

    $email_client_message .= "Имя: ".clean_string($name)."\n";
		$email_client_message .= "Email: ".clean_string($email_from)."\n";
		$email_client_message .= "Телефон: ".clean_string($country_code)." ".clean_string($telephone)."\n";

// create email headers
$client_headers = 'From:'.$email_to."\r\n".
'Reply-To: '.$email_to."\r\n" .
'X-Mailer: PHP/' . phpversion();

$headers = 'From: '.$email_from."\r\n".
'Reply-To: '.$email_from."\r\n" .
'X-Mailer: PHP/' . phpversion();
@mail($email_to, $email_subject, $email_message, $headers);

@mail($email_from, $email_client_subject, $email_client_message, $client_headers);
?>

<?php

}
?>