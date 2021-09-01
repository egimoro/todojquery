$(document).ready(function() {
    // get the CSRF token
    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    var editedItem = null;

    // send a GET request to build the list of todos
    $.ajax({
      url: '/todo-list/',
      type: 'GET',
      dataType: 'json',
    }).done(function(response) {
        for (var i in response.todos) {
          var todo = `<span>${response.todos[i].name}</span>`
          if (response.todos[i].completed) {
            var todo = `<span><del>${response.todos[i].name}</del></span>`
          }
          var item = `
          <li class="list-group-item d-flex justify-content-between">
            ${todo}
            <div>
              <button id="edit" class="btn btn-success btn-sm" type="submit">Edit</button>
              <button id="delete" class="btn btn-danger btn-sm" type="submit">Delete</button>
            </div>
          </li>
          `
          $('.list-group').append(item) // append the new item to the <ul> tag
        }
      })

    /* send a POST request to create a todo */
    $('#form').submit(function(e) {
      e.preventDefault(); // prevent the page from reload
      var url = "/todo-create/"
      var data = {
        todo_name: $('#todo_name').val(),
        csrfmiddlewaretoken: csrftoken,
      }
      if (editedItem != null) {
        var url = "/todo-edit/"
        var data = {
          todo_name: editedItem.children().first().text(), // the todo's name that we want to change
          new_todo_name: $('#todo_name').val(), // the new todo's name
          csrfmiddlewaretoken: csrftoken
        }
      }

      $.ajax({
        url: url,
        type: 'POST',
        data: data,
      }).done(function(response) {
          if (response.status === 'error') {
            alert("todos must have unique name.")
          } else if (response.status === 'created') {
            var temp = `
            <li class="list-group-item d-flex justify-content-between">
              <span>${response.todo_name}</span>
              <div>
                <button id="edit" class="btn btn-success btn-sm" type="submit">Edit</button>
                <button id="delete" class="btn btn-danger btn-sm" type="submit">Delete</button>
              </div>
            </li>
            `
            $('.list-group').append(temp)
          } else if (response.status === 'updated') {
            // editedItem refers to the item the user wants to change
            editedItem.children().first().text(response.new_todo_name)
            editedItem = null;
          }         
        })
      $(this).trigger('reset') // reset the form
    })

    /* attach the click event to the li tag */
    $('ul').on('click', 'li', function() {
      var url = "/todo-edit/"
      var todo_name = $(this).children().first().text()
      var span_tag = $(this).children().first()
      var completed = span_tag.children().length

      if (!completed) {
        completed = 1
      } else {
        completed = 0
      }

      $.ajax({
        url: url,
        type: 'POST',
        data:{
          todo_name: todo_name,
          completed: completed,
          csrfmiddlewaretoken: csrftoken
        },
      }).done(function(response) {
        if (response.status == 'updated' & completed) {
          span_tag.empty() // remove the text from the span tag (remove the todo's name)
          span_tag.append(`<del>${todo_name}</del>`)
        } else if (response.status === 'updated' & !completed) {
          span_tag.remove($('del'))
          span_tag.text(todo_name)
        }            }) 
    }).on('click', '#edit', function(event) {
      event.stopPropagation(); // prevent the parent handler from being notified of the event
      var li_tag = $(this).parent().parent() // `this` refer to the edit button

      editedItem = li_tag
      $('#todo_name').val(editedItem.children().first().text())    
    }).on('click', '#delete', function(event) {
      event.stopPropagation()
      var url = "/todo-delete/"
      var li_tag = $(this).parent().parent()

      $.ajax({
        url: url,
        type: 'POST',
        data: {
          todo_name: li_tag.children().first().text(),
          csrfmiddlewaretoken: csrftoken
        },
      }).done(function(response) {
          if (response.status === 'deleted') {
            li_tag.remove()
          }
        })
    })
  })