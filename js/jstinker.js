$("document").ready(function() {

    $.ajax({
      url : "samples/"+sample,
      success : function(result){
          var initCode = ace.edit("html-editor").getSession();
          event.preventDefault();
          initCode.setValue(result);
          $("#btnRun").click();
      }
    });

    $("#sample-selector").change(function(event){
      $.ajax({
        url : "samples/"+this.value,
        success : function(result){
            var initCode = ace.edit("html-editor").getSession();
            event.preventDefault();
            initCode.setValue(result);
            $("#btnRun").click();
        }
      });
    });
    $("#btnRun").click(function(event) {
        event.preventDefault();
        $('#ifamePreview').empty();
        $('#ifamePreview').html("<iframe class='previewEditor' id='preview' name='result' sandbox='allow-forms allow-popups allow-scripts allow-same-origin' frameborder='0'>#document</iframe>")
        var previewDoc = window.frames[0].document;
        var html   = ace.edit("html-editor").getSession().getValue();
        var html2 = style_html(html);
        previewDoc.write(html2);
        previewDoc.close();
    });



    // TIDYUP Button
    $("#btnTidyUp").click(function(event) {
        event.preventDefault();
        var html = ace.edit("html-editor").getSession().getValue();
        var html2 = style_html(html);
        ace.edit("html-editor").getSession().setValue(html2);

    });

});
