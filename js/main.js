require([
  "esri/portal/Portal",
  "esri/identity/OAuthInfo",
  "esri/identity/IdentityManager",
  "esri/portal/PortalQueryParams",
  "dojo/dom-attr",
  "dojo/dom",
  "dojo/_base/array",
  "esri/request",
  "dojo/domReady!"
], function(Portal, OAuthInfo, esriId, PortalQueryParams,
  domAttr, dom, arrayUtils,esriRequest) {


  var portal;
  var info = new OAuthInfo({
    appId: "VfuUm3nDN4P89zTn",
    popup: false
  });
  var title;
  var tags;

  init();

// Load Samples And set listner for select dropdown
  function load_samples(){
    ace.require("ace/ext/language_tools");
    var htmlEditor = ace.edit("html-editor");
    htmlEditor.setTheme("ace/theme/crimson-editor");
    htmlEditor.getSession().setMode("ace/mode/html");
    htmlEditor.setOptions({enableBasicAutocompletion: true});
    var sample = "vectorTiles.html";

    $.ajax({
      url : "samples/"+sample,
      success : function(result){
          var initCode = ace.edit("html-editor").getSession();
          event.preventDefault();
          initCode.setValue(result);
          run_code();
      }
    });

    $("#sample-selector").change(function(event){
      $.ajax({
        url : "samples/"+this.value,
        success : function(result){
            var initCode = ace.edit("html-editor").getSession();
            event.preventDefault();
            initCode.setValue(result);
            run_code();
        }
      });
    });
  }

  function sign_in(){
      esriId.getCredential(info.portalUrl + "/sharing");
  }

  function sign_out(){
      esriId.destroyCredentials();
      window.location.reload();
  }

  function run_code(){
    event.preventDefault();
    $('#ifamePreview').empty();
    $('#ifamePreview').html("<iframe class='previewEditor' id='preview' name='result' sandbox='allow-forms allow-popups allow-scripts allow-same-origin' frameborder='0'>#document</iframe>")
    var previewDoc = window.frames[0].document;
    var html   = ace.edit("html-editor").getSession().getValue();
    var html2 = style_html(html);
    previewDoc.write(html2);
    previewDoc.close();
  }

  function tidyup_code(){
    event.preventDefault();
    var html = ace.edit("html-editor").getSession().getValue();
    var html2 = style_html(html);
    ace.edit("html-editor").getSession().setValue(html2);
  }

  function run_upload(){
    $('#agol_upload_form')[0].reset();
    $('#upload_agol_model').modal({ keyboard: false });
    $('#upload_agol_model').modal('show');

    // var formData = new FormData();
    // formData.append('f', "json");
    // formData.append('token', portal.credential.token);
    // formData.append('title', "Test2 Upload GisOnline-me");
    // formData.append('type', "Code Sample");
    // formData.append('tags', "web, mapping, application");
    // formData.append('file', f);
              // $.ajax({
              //     url: portal.user.userContentUrl + "/addItem",
              //     data: formData,
              //     type: 'POST',
              //     processData: false,
              //     enctype:"multipart/form-data",
              //     contentType: false,
              //     success: function (data) {
              //         console.log(data);
              //     },
              //     error:function(err){
              //       console.log(err)
              //     }
              // });

  }

  function get_userDetails(callback){
    var obj = {
      f:"json",
      token:portal.credential.token
    }
    $.post( portal.user.userContentUrl,obj, function( data ) {
      callback(JSON.parse(data))
    });
  }

  function make_folder(){
    var obj = {
      f:"json",
      token:portal.credential.token,
      title:"gisonline-me"
    }
    $.post( portal.user.userContentUrl + "/createFolder",obj, function( data ) {
      data = JSON.parse(data);
      if(data.success){
        portal.folderID = data.folder.id;
      }else{
        console.log(data);
      }
    });
  }

  function get_code_sample_from_folder(data){
    var obj = {
      f:"json",
      token:portal.credential.token,
    }
    $.post( portal.user.userContentUrl + "/"+portal.folderID ,obj, function( data ) {
      data = JSON.parse(data);
      var items = data.items;
      if (items.length !=0){
        var html = "<option></option>";
        for (var i = 0; i < items.length; i++) {
          html += "<option value='"+items[i].id+"'>"+items[i].title+"</option>";
        }
        $("#agol_folder_code_samples").html(html);
        $("#agol_folder_code_samples").change(function(event){
          var link = document.createElement("a");
          link.href = "https://www.arcgis.com/sharing/rest/content/items/"+this.value+"/data"+"?token="+portal.credential.token;
          link.click();
        });
        $('.selectpicker').selectpicker('refresh');

      }else{
        //Hide select option

      }

      // if(data.success){
      //   portal.folderID = data.folder.id;
      // }else{
      //   console.log(data);
      // }
    });
  }

  function create_folder(){
    get_userDetails(function(data){

      // Set Folders
      var folders = data.folders
      if (folders.length != 0){
        for (var i = 0; i < folders.length; i++) {
          if (folders[i].title == "gisonline-me"){
            portal.folderID = folders[i].id;
            // Folder existed
            // populate codeList
            get_code_sample_from_folder();
            break;
          }
        }
        if (!portal.folderID){
          // None of the folders are gisonline-me so make it
          make_folder()
        }
      }else{
        // There are no foldes in the account so make gisonline.me
        make_folder()
      }
    });

  }

  function get_content_url(){
    var contentURL = "";
    if (portal.folderID){
      contentURL = portal.user.userContentUrl + "/" + portal.folderID ;
    }else{
      contentURL = portal.user.userContentUrl
    }
    return contentURL
  }

  function agol_submit(){
    var title = $('#item_title').val();
    var tags = $('#item_tag').val();
    var code_values = ace.edit("html-editor").getSession().getValue();
    var zip = new JSZip();
    zip.folder("gisonline-me-sample").file("index.html", code_values);
    var temp = zip.generateAsync({type:"blob"}).then(function(content) {
      var title = $('#item_title').val();
      var tags = $('#item_tag').val();
      var code_values = ace.edit("html-editor").getSession().getValue();

      var output_zip = title.replace( /\s/g, "")+".zip"

      var f = new File([content],output_zip);

      var formData = new FormData();
      formData.append('f', "json");
      formData.append('token', portal.credential.token);
      formData.append('title', title);
      formData.append('type', "Code Sample");
      formData.append('tags', tags);
      formData.append('file', f);

      $.ajax({
          url: get_content_url() + "/addItem",
          data: formData,
          type: 'POST',
          processData: false,
          enctype:"multipart/form-data",
          contentType: false,
          success: function (data) {
            $('#upload_agol_model').modal('hide');
              var data = JSON.parse(data);
              $('#submit_model').modal({ keyboard: false });
              console.log(data)
              if (data.success){
                //show success modal
                $("#submit_modelLabel").html("Successfully Published Item");
                  $("#submit_modelBody").html("<a target='_blank' id='open_agol_link' href='"+"http://www.arcgis.com/home/item.html?id="+data.id+"'>Open Item In ArcGIS Online");
                $("#submit_image_block").html("<img class='submit_img' src='images/check_mark.png' />");
              }else{
                $("#submit_modelLabel").html("Whoops! Something went wrong");
                $("#submit_modelBody").html("<h4>"+data.error.message+"</h4><br/> <h5>Try remaining your code sample</h5>");
                $("#submit_image_block").html("<img class='submit_img' src='images/x_mark.png' />");
                // Show error message Modal
              }
              $('#submit_model').modal('show');
              get_userDetails(function(data){
                get_code_sample_from_folder(data);
              });



          },
          error:function(err){
            console.log(err)
            $('#upload_agol_model').modal('hide');
            //Show error Modal
          }
      });

    });
  }

  function set_login(){
    esriId.registerOAuthInfos([info]);
    esriId.checkSignInStatus(info.portalUrl + "/sharing").then(
      function() {
        $("#anonymousPanel").css("display","none");
        $("#loggedInPanel").css("display","block");
        setup_portal();
      }
    ).otherwise(
      function() {

        $("#anonymousPanel").css("display","block");
        $("#loggedInPanel").css("display","none");
      }
    );
  }

  function download_code(){
    var content = ace.edit("html-editor").getSession().getValue();
    var zip = new JSZip();
    //ToDo Add Dialod for name
    zip.folder("gisonline-me-sample").file("index.html", content);
    var zipFile = zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "gisonline-me-sample.zip");
    });
  }

  function set_click_listners(){

    $("#btnRun").click(function(event) {
        run_code();
    });

    $("#btnTidyUp").click(function(event) {
      tidyup_code();

    });

    $( "#btnSignIn" ).click(function() {
      sign_in();
    });

    $( "#btnSignOut" ).click(function() {
      sign_out();
    });

    $("#btnUpload").click(function() {
        run_upload();
    });

    $("#btnDownload").click(function() {
        download_code();
    });

    $('#agol_submit').click(function(){

      agol_submit();
    })
  }

  function init(){
      set_click_listners();
      load_samples();
      set_login();
  }

  function setup_portal() {
    portal = new Portal();
    portal.authMode = "immediate";
    portal.load().then(function() {
      var queryParams = new PortalQueryParams({
        query: "owner:" + portal.user.username,
        sortField: "numViews",
        sortOrder: "desc",
        num: 20
      });
      portal.queryItems(queryParams).then(createGallery);
      $("#username").html(portal.user.username + " ");
      console.log(portal);
      console.log(portal.user.username);
      create_folder();

    });
  }
  function sendData(content){

    // var f = new File([content],"ext2.zip");
    //
    // var formData = new FormData();
    // formData.append('f', "json");
    // formData.append('token', portal.credential.token);
    // formData.append('title', "ext2 Upload GisOnline-me");
    // formData.append('type', "Code Sample");
    // formData.append('tags', "web, mapping, application");
    // formData.append('file', f);
    //
    // $.ajax({
    //     url: portal.user.userContentUrl + "/addItem",
    //     data: formData,
    //     type: 'POST',
    //     processData: false,
    //     enctype:"multipart/form-data",
    //     contentType: false,
    //     success: function (data) {
    //         console.log(data);
    //     },
    //     error:function(err){
    //       console.log(err)
    //     }
    // });
  }

  function createGallery(items) {
    // var zip = new JSZip();
    //
    // zip.file("Hello.txt", "Hello World\n");
    // // var zipData = zip.generateAsync({type:"base64"}).th;
    //
    // var temp = zip.generateAsync({type:"blob"}).then(function(content) {
    //     sendData(content);
    // });
  }


  // Working
  // var formData = new FormData();
  // formData.append('f', "json");
  // formData.append('token', portal.credential.token);
  // formData.append('title', "Test2 Upload GisOnline-me");
  // formData.append('type', "Code Sample");
  // formData.append('tags', "web, mapping, application");
  // formData.append('file', f);
  //
  // $.ajax({
  //     url: portal.user.userContentUrl + "/addItem",
  //     data: formData,
  //     type: 'POST',
  //     processData: false,
  //     enctype:"multipart/form-data",
  //     contentType: false,
  //     success: function (data) {
  //         console.log(data);
  //     },
  //     error:function(err){
  //       console.log(err)
  //     }
  // });
});
