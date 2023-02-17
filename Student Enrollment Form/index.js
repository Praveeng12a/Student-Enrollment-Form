
/* We Required the credential that is  :
jpdbBaseURL,
jpdbIRL,
jpdbIML,
dbName,
RelationName,
connectionToken
 */


// Storing all the credential into variable.

var jpdbBaseURL = 'http://api.login2explore.com:5577';
var jpdbIRL = '/api/irl';
var jpdbIML = '/api/iml';
var dbName = 'School';
var RelationName = 'Student-Relation';
var connectionToken = '90932584|-31949277705058169|90948986';


// Function for disable all element on page except roll number input feild
const disableAllFeildExceptRollno = () => {
    $('#fullName').prop('disabled', true);
    $('#class').prop('disabled', true);
    $('#birthDate').prop('disabled', true);
    $('#inputAddress').prop('disabled', true);
    $('#enrollmentDate').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
}


//Function for reset form data and disable all other feild except roll number
const resetform = () => {
    $('#rollNo').val("");
    $('#fullName').val("");
    $('#class').val("");
    $('#birthDate').val("");
    $('#inputAddress').val("");
    $('#enrollmentDate').val("");

    $('#rollNo').prop('disabled', false);
    disableAllFeildExceptRollno();
    $('#rollNo').focus();
}

function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

//Function for fill data if student already is present in database
function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#fullName').val("");
        $('#class').val("");
        $('#birthDate').val("");
        $('#inputAddress').val("");
        $('#enrollmentDate').val("");
    } else {
        // student record number saved to localstorage
        saveRecNoToLocalStorage(jsonObject);

        // parse json object into JSON
        var data = JSON.parse(jsonObject.data).record;

        $('#fullName').val(data.name);
        $('#class').val(data.className);
        $('#birthDate').val(data.birthDate);
        $('#inputAddress').val(data.address);
        $('#enrollmentDate').val(data.enrollmentDate);
    }
}

//Function to check validity of Enrollment Number
const verifyingEnrollment = function () {
    var inputBirthDate = $('#birthDate').val();
    var inputEnrollmentDate = $('#enrollmentDate').val();
    inputBirthDate = new Date(inputBirthDate);
    inputEnrollmentDate = new Date(inputEnrollmentDate);

    var verifiedEnrollmentDate = inputBirthDate.getTime() < inputEnrollmentDate.getTime();
    return verifiedEnrollmentDate;

}

//Function to check validity of data
const validateFormData = function () {
    var rollNo, name, className, birthDate, address, enrollmentDate;
    rollNo = $('#rollNo').val();
    name = $('#fullName').val();
    className = $('#class').val();
    birthDate = $('#birthDate').val();
    address = $('#inputAddress').val();
    enrollmentDate = $('#enrollmentDate').val();

    if (rollNo === '') {
        alert('Roll NO Missing');
        $('#rollNo').focus();
        return "";
    }

    if (name === '') {
        alert('name is missing');
        $('#fullName').focus();
        return "";
    }

    if (rollNo <= 0) {
        alert('Invalid Roll-No');
        $('#rollNo').focus();
        return "";
    }

    if (className === '') {
        alert('Class Name is Missing');
        $('#class').focus();
        return "";
    }

    if (birthDate === '') {
        alert('Birth Date Is Missing');
        $('#birthDate').focus();
        return "";
    }
    if (address === '') {
        alert('Address Is Missing');
        $('#address').focus();
        return "";
    }
    if (enrollmentDate === '') {
        alert('Enrollment Data Is Missing');
        $('#enrollmentDate').focus();
        return "";
    }

    if (!verifyingEnrollment()) {
        alert('Invalid Enrollment Date');
        $('#enrollmentData').focus();
        return "";
    }

    // if data is valid then create a JSON object otherwise return empty string
    var jsonStrObj = {
        id: rollNo,
        name: name,
        className: className,
        birthDate: birthDate,
        address: address,
        enrollmentDate: enrollmentDate
    };

    return JSON.stringify(jsonStrObj);
}

// to get the roll no as Json Objectw
function getStudentRollnoAsJsonObj() {
    var rollNO = $('#rollNo').val();
    var jsonStr = {
        id: rollNO
    };
    return JSON.stringify(jsonStr);
}

// Function to GET request
function getData() {
    if ($('#rollNo').val() === "") {
        disableAllFeildExceptRollno();
    } else if ($('#rollNo').val() < 1) {
        disableAllFeildExceptRollno();
        alert('Invalid Roll-No');
        $('#rollNo').focus();
    } else {
        var studentRollnoJsonObj = getStudentRollnoAsJsonObj();

        // creating the GET Request 
        var getRequest = createGET_BY_KEYRequest(connectionToken, dbName, RelationName, studentRollnoJsonObj);

        jQuery.ajaxSetup({ async: false });
        // making the GET request
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({ async: true });

        // Enable all feild
        $('#rollNo').prop('disabled', false);
        $('#fullName').prop('disabled', false);
        $('#class').prop('disabled', false);
        $('#birthDate').prop('disabled', false);
        $('#inputAddress').prop('disabled', false);
        $('#enrollmentDate').prop('disabled', false);


        if (resJsonObj.status === 400) {
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            fillData("");
            $('#name').focus();
        } else if (resJsonObj.status === 200) {
            $('#rollNO').prop('disabled', true);
            fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#name').focus();
        }

    }
}


//Function to make PUT request to save data into database
function saveData() {
    var jsonStrObj = validateFormData();

    // If Data is not valid then return empty strings
    if (jsonStrObj === '')
        return '';

    // creating the PUT Request object
    var putRequest = createPUTRequest(connectionToken, jsonStrObj, dbName, RelationName);
    jQuery.ajaxSetup({ async: false });

    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });


    if (resJsonObj.status === 400) {
        alert('Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {
        alert('Data Saved successfully');
    }

    resetform();
    $('#rollNo').focus();
}


//Function used to make UPDATE Request
function updateData() {
    $('#changeBtn').prop('disabled', true);
    var jsonChg = validateFormData();

    // Creating the UPDATE Request
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, dbName, RelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({ async: false });

    //Making the UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });


    if (resJsonObj.status === 400) {
        alert('Data Is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {
        alert('Data Updated successfully');
    }

    resetform();
    $('#rollNo').focus();
}