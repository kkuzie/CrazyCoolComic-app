// (function(){
//     "use strict";
//     localStorage.setItem("publisher", "archieComics");   

//     console.log(localStorage.getItem("publisher"));


//log in and out
//all code to be between onDeviceReady function
document.addEventListener('deviceready', onDeviceReady(), false);
function onDeviceReady(e) {
    console.log('device is ready, yay!');

    //Variables (Objects) for the Signup, Login, and Logout forms&buttons
    //   const formSignup = $('#form-signup'),
    //         formLogin = $('#form-login'),
    //         btnLogout = $('#btn-logout');
    //         console.log(formSignup);
    //         console.log(formLogin);
    //         console.log(btnLogout);

    //POUCH DB
    let myDB = new PouchDB("myComics");
    const formSave= $("#form-save");//CHANGE THIS NAME*****************

    //Event Listener
    //form SIGNUP
    $('#form-signup').submit(function (e) {
        fnSignup(e);
        console.log('made it to fnSignup(e)');
    });
    // const test = document.getElementById('form-sign');
    // document.getElementById('form-signup').addEventListener('submit', function(e){
    //     console.log('this worked');
    // });
    //form LOGIN
    $('#form-login').submit(function (e) {
        fnLogin(e);
        console.log('made it to fnLogin(e)');
    });

    //CANCEL BTN clears forms
    $('.cancel-btn').click(function(){
        fnCancel();
        console.log('fnCancel clears the form');
    });
    
    //LOGOUT
    $('#btn-logout').click(function () {//WHY NO e HERE??cuz click not submit?
        fnLogout();
        console.log('made it to fnLogout(e)');
    });

    //SAVE COMICS
    formSave.submit(function(){
        fnSaveComic(e);
    });

    //for when tapping on a row of comics - OPEN EDIT 'PAGE'
    //added  'tr.btnShowComicInfo' since the rows dont show up until a comic is added
    $('#form-view').on('click', 'tr.btnShowComicInfo', function(){
        fnEditComic($(this));
    });

    //EDIT comics
    //updating a comic
    $('#form-edit').submit(function(e){
        fnEditConfirm(e);
    });

    //CANCEL EDITTING
    $('#edit-cancel-btn').on('click', fnEditCancel);

    //DELETE ONE comic
    $('#edit-delete-btn').on('click', fnEditDelete);


    //Functions

///////////////////////////////////////////////////
    //******SIGNUP function*******
    function fnSignup(e) {
        console.log('here ok?');
        e.preventDefault();//prevent auto refresh
        console.log('fnSignup(e) is working yay!');

        //validation for signup
        let storeInfo = {
            suname: $('#form-name').val(),
            suusername: $('#form-username').val(),
            suemail: $('#form-email').val().toUpperCase(),
            supw: $('#form-pw').val()
        }
        console.log(storeInfo);


        //local storage for signup details
        localStorage.setItem('storeInfo', JSON.stringify(storeInfo));

        $(':mobile-pagecontainer').pagecontainer('change', '#pgLogin');//:mobile-pagecontainer comes from jq mobile. pagecontainer pulls from html data-role

    };//end fnSignup function


    //CANCEL BUTTON function --- clears signup and login form
    function fnCancel() {
        console.log('form is cleared');
        $('#form-signup')[0].reset();
        $('#form-login')[0].reset();
    }

///////////////////////////////////////////////
    //******LOGIN function******
    function fnLogin(e) {
        console.log(e);
        e.preventDefault();
        console.log('fnLogin(e) is working yay!');

        const loginUsername = $('#loginUsername'),
                    loginpw = $('#loginpw');
                    tempLoginUsername = loginUsername.val(),
                    tempLoginpw = loginpw.val();

        //verify user exists
        if (localStorage.getItem('storeInfo') == null) {
            window.alert('Be Crazy, sign up!');
            window.localStorage.clear();
            $('#form-login')[0].reset();
       }
        else {
            let getStoreInfo = localStorage.getItem('storeInfo');
            let normalInfo = JSON.parse(getStoreInfo);

            if (tempLoginUsername === normalInfo ['suusername'] & (tempLoginpw === normalInfo['supw'])) {
                console.log('are you back at home screen?')
                $(':mobile-pagecontainer').pagecontainer('change', "#pgHome");
            } else {
                window.alert('Nope, not the right Login, try again.');
                $('#form-login')[0].reset();//then clears login form
           }
        }
    };

 /////////////////////////////////////////////////   
//******PREP/SAVE comics******
function fnPrepComic() { 
    console.log("fnPrepComic() is running"); 
    let saveTitle = $("#save-title").val(); 
    let saveIssue = $("#save-issue").val(); 
    let saveYear = $("#save-year").val();
    let savePublisher = $("#save-publisher").val();
    let saveNotes = $("#save-notes").val();

    let tmpComic = {  
        "_id" : saveTitle.replace(/\W/g,"") + saveYear + saveIssue,  
        "title" : saveTitle,  
        "number" : saveIssue,  
        "year" : saveYear,  
        "publisher" : savePublisher,  
        "notes" : saveNotes,
    }; 
    console.log(tmpComic);
    
    return tmpComic;
} // END fnPrepComic

function fnSaveComic(e) { 
    // e.preventDefault(); WHY DOESNT THIS WORK??
    console.log("fnSaveComic(e) is running");
    let aComic = fnPrepComic(); 

    myDB.put(aComic, function(failure, success){  
        if(failure) {    
            console.log("Error: " + failure.message);    
            window.alert("Comic already saved!");  
        } else {    
            console.log("Saved the comic: " + success.ok);    
            window.alert("Comic saved!");
            $(':mobile-pagecontainer').pagecontainer('change', "#pgView");
            fnViewComic();
        } // END else (Success)
    }); // END .put()

} // END fnSaveComic (e)

//////////////////////////////////////////
//*******VIEW comics*******

//function that loads data from database
function fnViewComic (){
    console.log("fnViewComic() is running");
    //allDocs PouchDB method to load the stored documents in database
    myDB.allDocs({"ascending":true, "include_docs": true},
        //check for failure or success
        function(failure, success){
            if(failure){
                console.log("Oops, not working" + failure);
            } else {
                console.log("Yay! it worked!" + success);
                
                //feedback for user
                if (success.rows[0] === undefined){
                    $("#form-view").html("No comics saved...yet!");
                } else {
                    console.log("These are your comics so far:" + success.rows.length);

                    //variable to store the Table that will be displayed on-screen. The first line of the Table include the code for the first row, as well as headings:
                    let comicData = "<table class='table'><tbody class='list'><tr><th>Title</th><th>#</th><th>Year</th><th>Publisher</th><th>Notes</th></tr>"
                    // <th>Edit</th><th>Delete</th>

                    //iterate over the number of items stored in the database
                    for(let i = 0; i <success.rows.length; i++){
                        // comicData += "<table class='table'>";
                        // console.log(comicData);
                        comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'><td>" + success.rows[i].doc.title +
                        "</td><td>" + success.rows[i].doc.number +
                        "</td><td>" + success.rows[i].doc.year +
                        "</td><td>" + success.rows[i].doc.publisher +
                        "</td><td>" + success.rows[i].doc.notes +
                        // "</td><td>" + '<i class="far fa-edit-alt" id="view-edit-one"></i>' +
                        // "</td><td>" + '<i class="far fa-trash-alt" id="view-delete-one"></i>' +
                        "</td>";
                    } //END for loop
                    comicData += "</tbody></table>";

                    //styling the output with CSS:
                    $("#form-view").html(comicData);
                }//END if/else for data-checking
            }//END if/else for .allDocs()
        })//END .allDocs();
}//END fnViewComic()

fnViewComic();

//////////////////////////////////////////////////////
//*****VIEW pg - DELETE button*******

//function to delete entire database

const viewDelete = $('#view-delete');//grab DELETE COLLECTION button

function fnViewDelete() {
    console.log('fnViewDelete() is running');

    //ask for confirmation of this action 
        if(window.confirm('Are ya sure ya wanna delete EVERYTHING?')) {
            console.log('yep, delete whole collection');

            //second confirmation
                if(window.confirm('ya sure? Really really sure? This is permanent!')) {
                    console.log('yep, delete whole collection, really!');

                    //after second confirmation - DELETE database

                    //****destroy METHOD*****  is used to delete a complete database */
                        myDB.destroy(function(failure, success){
                            if(failure) {
                                console.log('Something is wrong:' + failure.message);
                            } else {
                                console.log('Collection deleted:' + success.ok);
                                myDB = new PouchDB('myComics');
                                fnViewComic();
                                    window.alert('All gone!');
                            }//END if/else of .destroy()
                        })//END .destroy()

                } else {
                    console.log('Nope, changed my mind. Do not delete!!');
                }//END 2nd confirmation
        } else {
            console.log('Nope, keep the collection');
        }//END if/else confirmation

}//end fnViewDelete()

    // //DELETE ONE comics with icon instead of row
    // viewDeleteOne.on("click", fnViewDeleteOne);

    // const viewDeleteOne = $('#view-delete-one');//grab DELETE COLLECTION button

    // function fnViewDeleteOne() {
    //     console.log('fnViewDeleteOne() is running');
    
    //     //ask for confirmation of this action 
    //         if(window.confirm('Are ya sure ya wanna delete this comic?')) {
    //             console.log('yep, delete just this one');
    
    //             //second confirmation
    //                 if(window.confirm('ya sure? Really really sure? This is permanent!')) {
    //                     console.log('yep, delete just this one, really!');
    
    //                     //after second confirmation - DELETE database
    
    //                     //****destroy METHOD*****  is used to delete a complete database */
    //                         myDB.destroy(function(failure, success){
    //                             if(failure) {
    //                                 console.log('Something is wrong:' + failure.message);
    //                             } else {
    //                                 console.log('One comic deleted:' + success.ok);
    //                                 myDB = new PouchDB('myComics');
    //                                 fnViewComic();
    //                                     window.alert('All gone!');
    //                             }//END if/else of .destroy()
    //                         })//END .destroy()
    
    //                 } else {
    //                     console.log('Nope, changed my mind. Do not delete!!');
    //                 }//END 2nd confirmation
    //         } else {
    //             console.log('Nope, keep the comic');
    //         }//END if/else confirmation
    
    // }//end fnViewDelete()







////////////////////////////////////////////////////
//**********EDIT comics***********

//variable to keep track of which comic to update
//initially is empty so nothing in ""
let comicWIP = "";

//detects which row was tapped on in #pgView,
//loads data of chosen comic
//displays edit screen
    function fnEditComic(thisComic){
        console.log("fnEditComic(e) is running:" + thisComic.context.id);//adds the title of the comic retrieved plus a number(what is the number???)

        // Retrieve the data of the comic we tapped, fill the fields, load the dialog, set comicWIP
        myDB.get(thisComic.context.id, function(failure, success){
            if(failure){
                console.log('Error getting the comic: ' + failure.message);
            }else{
                console.log('Success getting the comic: ' + success.title);//adds the title of the comic retrieved

                // $('#view-edit-one').val(success.edit)
                    $('#edit-title').val(success.title);
                    $('#edit-number').val(success.number);
                    $('#edit-year').val(success.year);
                    $('#edit-publisher').val(success.publisher);
                    $('#edit-notes').val(success.notes);
                    comicWIP = success._id;
            }//END .get() if/else
        });//END .get()

        $(':mobile-pagecontainer').pagecontainer('change', '#pgEdit', {'role': 'dialog'});

    }//END fnEditComic(thisComic)

    ///////////////////////////////////////////////
    //****** CANCEL EDIT********
        function fnEditCancel(){
        console.log("fnEditCancel() is running");
        $('#pgEdit').dialog('close');
        // alert('nothing changed.');
        //to RETURN TO VIEW PAGE
        $(':mobile-pagecontainer').pagecontainer('change', "#pgView");
        fnViewComic();
    }//END fnEditCancel()

    ///////////////////////////////////////////////////////////////////////
    //******SUBMIT/CONFIRM updates to the comic
    function fnEditConfirm(e){
        e.preventDefault();
        console.log("fnEditConfirm() is running with " + comicWIP);

        //re-reads the edit fields and confirms the comic about to be updated exists
        let $valEditTitle = $('#edit-title').val(),
            $valEditNumber = $('#edit-number').val(),
            $valEditYear = $('#edit-year').val(),
            $valEditPublisher = $('#edit-publisher').val(),
            $valEditNotes = $('#edit-notes').val();

        //confirm exists and update an entry in PouchDB
        myDB.get(comicWIP, function(failure, success){
            if(failure) {
                console.log('Error: ' + failure.message);
            } else {
                console.log('About to update: ' + success._id);

        //re-reads the edit fields and re-inserts them to the database
        myDB.put({
            '_id': success._id, 
            'title': $valEditTitle, 
            'number': $valEditNumber,
            'year': $valEditYear,
            'publisher': $valEditPublisher,
            'notes': $valEditNotes,
            '_rev': success._rev //******_rev PROPERTY****** is used to update one database entry */
        },
        function(failure, success){
            if(failure){
                console.log('Error: ' + failure.message);
            } else {
                console.log('Updated comic: ' + success.ok);
                fnViewComic();
                $('#pgEdit').dialog('close');
                alert('You have updated your comic!');
            }//END .put () if/else
        });//END .put()
        
            }//END get() if/else
        });//END .get()

    }//END fnEditConfirm(e)


//////////////////////////////////////////////////////
    //******delete ONE entry**********

    function fnEditDelete(){
        console.log('fnEditDelete() is running');

        //confirm entry exists before delete
        myDB.get(comicWIP, function(failure, success){
            if(failure) {
                console.log('Error: ' + failure.message);
            } else {
                console.log('Deleting: ' + success._id);

                //confirmation of deletion
                if (window.confirm('Are ya positively sure you want to delete this comic?')) {
                    console.log("It's deleted");

                    //******remove METHOD****** is used to delete only one database entry */
                    myDB.remove(success, function(failure, success){
                        if(failure) {
                            console.log('Could not delete: ' + failure.message);
                        } else {
                            console.log('Deleted comic: ' + success.ok);
                            fnViewComic();
                            $('#pgEdit').dialog('close');
                            alert('Comic deleted!');
                            //to RETURN TO VIEW PAGE
                            $(':mobile-pagecontainer').pagecontainer('change', "#pgView");
                            fnViewComic();
                        }//END .remove() if/else
                    });//END .remove()
                } else {
                    console.log('Canceled deletion');
                }//END if/else confirmation
            }//END .get() if/else
        }); //END .get()
    }//END fnEditDelete()
    

        ///////////////////////////////////
    //******LOGOUT******

    function fnLogout() {
        let logout = window.confirm("Yep, I'm ready to logout");
        if (logout = true) {
            $(':mobile-pagecontainer').pagecontainer('change', '#pgWelcome');
            $('#form-signup')[0].reset();//clear signup form on logout
            $('#form-login')[0].reset();//clear login form on logout
        }
    }

//    RESET forms
    $('#form-signup')[0].reset();
    $('#form-login')[0].reset();
    $('#form-save')[0].reset();  


// var search = document.querySelector('#search');

//     function myFunction() {
//         var input, filter, table, tr, td, i, txtValue;
//         input = document.getElementById("search-input");
//         filter = input.value.toLowerCase();
//         table = document.getElementsByClassName("table");
//         tr = table.getElementsByTagName("tr");
//         for (i = 0; i < tr.length; i++) {
//           td = tr[i].getElementsByTagName("td")[0];
//           if (td) {
//             txtValue = td.textContent || td.innerText;
//             if (txtValue.toLowerCase().indexOf(filter) > -1) {
//               tr[i].style.display = "";
//             } else {
//               tr[i].style.display = "none";
//             }
//           }       
//         }
//       }
// const table = document.querySelector('tbody.list');
// console.log(table);

// const search = document.querySelector('.search input');
// //row counter-variables:
// let count = document.querySelector('tbody');//grab table
// console.log(count);

// let rows = count.getElementsByTagName("tr");
// console.log(rows);//grab rows collection

// let comic = Array.from(count.children).length;
// console.log(comic);//change table to array and give length

//     //add & remove filtered class
// const filterComics = (term) => {
//     Array.from(table.children)
//         .filter((comic) => {
//             return !comic.textContent.toLowerCase().includes(term);
//         })
//         .forEach((comic) => empl.classList.add('filtered'));

// Array.from(table.children)
// .filter((comic) => {
//     return comic.textContent.toLowerCase().includes(term);
// })
// .forEach((comic) => comic.classList.remove('filtered'));
//   counterFunc();
// };
// //keyup event for search
// search.addEventListener('keyup', () => {
//     const term = search.value.trim().toLowerCase();
//     filterComics(term);
  
// });


// search.addEventListener('keyup', (e) => {
//  myFunction();

// });


}//end onDeviceReady function











    // Get data:
    // let temporary1 = localStorage.getItem("username2");
    // console.log(temporary1);

    // document.write(temporary1);

    // console.log(localStorage.getItem("username"));
// });

// $('.txt').html(function(i, html) {
//     var chars = $.trim(html).split("");

//     return '<span>' + chars.join('</span><span>') + '</span>';
//   });