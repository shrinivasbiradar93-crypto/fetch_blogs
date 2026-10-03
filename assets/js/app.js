const cl = console.log;

const form = document.getElementById("form")
const title = document.getElementById("title")
const content = document.getElementById("content")
const userId = document.getElementById("userId")
const addBlogs = document.getElementById("addBlogs")
const updateBlogs = document.getElementById("updateBlogs")
const container = document.getElementById("container")
const spinner = document.getElementById("spinner")

let BASE_URL = "https://fetchbolgs-default-rtdb.firebaseio.com/";
let BLOGS_URL = `${BASE_URL}/blogs.json`

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: "success",
        timer: 3000
    })
}

const state = {
    blogsArr: [],
    editId: null,
}

function showSpinner() {
    spinner.classList.remove("d-none")
}

function hideSpinner() {
    spinner.classList.add("d-none")
}

function createBlogCards(arr) {
    let result = ``;
    arr.forEach(blog => {
        result += `<div class="col-md-4 mt-3" id="${blog.id}">
                <div class="card h-100">
                    <div class="card-header">
                        <h4>${blog.title}</h4>
                    </div>
                    <div class="card-body">
                        <p>${blog.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-outline-primary">Edit</button>
                        <button onclick="onDelete(this)" type="button" class="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                </div>
            </div>`
    })

    container.innerHTML = result;
}

function fetchBlogs() {
    showSpinner()

    fetch(BLOGS_URL, {
        method: "GET",
        body: null,
        headers: {
            "Content-type": "application/json",
            "Authentication": "TOKEN JWT form LS",
        }
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            for (const key in data) {
                data[key].id = key
                state.blogsArr.unshift(data[key])
            }
            createBlogCards(state.blogsArr)
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}

function onAddBlog(eve) {
    eve.preventDefault();

    let blogObj = {
        title: title.value,
        content: content.value,
        userId: userId.value,
    }
    showSpinner()
    fetch(BLOGS_URL, {
        method: "POST",
        body: JSON.stringify(blogObj),
        headers: {
            "Content-type": "application/json"
        }
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            blogObj.id = data.name
            state.blogsArr.unshift(blogObj)
            form.reset()

            let col = document.createElement("div")
            col.className = "col-md-4 mt-3"
            col.innerHTML = `<div class="card h-100">
                    <div class="card-header">
                        <h4>${blogObj.title}</h4>
                    </div>
                    <div class="card-body">
                        <p>${blogObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-outline-primary">Edit</button>
                        <button onclick="onDelete(this)" type="button" class="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                </div>`

            container.prepend(col)
            snackbar("Blog added successfully !!!", "success")
        })
        .catch(err => {
            snackbar("Failed to update blog!!!", "error")
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}

function onEdit(ele) {
    let EDIT_ID = ele.closest(".col-md-4").id;
    state.editId = EDIT_ID;
    let EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`

    showSpinner()

    fetch(EDIT_URL, {
        method: "GET",
        body: null,
        headers: {
            "Content-type": "application/json",
            "Authorization": "TOKEN JWT form LS"
        }
    })

        .then(res => {
            return res.json()
        })
        .then(res => {
            title.value = res.title;
            content.value = res.content;
            userId.value = res.userId;

            addBlogs.classList.add("d-none")
            updateBlogs.classList.remove("d-none")
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })
}

function onUpdate() {
    let UPDATE_ID = state.editId;
    let UPDATE_URL = `${BASE_URL}/blogs/${UPDATE_ID}.json`

    let updateObj = {
        title: title.value,
        content: content.value,
        userId: userId.value,
        id: UPDATE_ID
    }

    showSpinner()

    fetch(UPDATE_URL, {
        method: "PATCH",
        body: JSON.stringify(updateObj),
        headers: {
            "Content-type": "application/json",
            "Authorization": "TOKEN JWT form LS",
        }
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            cl(data)
            let getIndex = state.blogsArr.findIndex(a => a.id === UPDATE_ID)
            state.blogsArr[getIndex] = updateObj;
            let col = document.getElementById(UPDATE_ID);

            col.innerHTML = `<div class="card h-100">
                    <div class="card-header">
                        <h4>${updateObj.title}</h4>
                    </div>
                    <div class="card-body">
                        <p>${updateObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-outline-primary">Edit</button>
                        <button onclick="onDelete(this)" type="button" class="btn btn-sm btn-outline-danger">Delete</button>
                    </div>
                </div>`

            form.reset()
            snackbar(`The blog with ${UPDATE_ID} is updated successufully !!!`, "success")

            addBlogs.classList.remove("d-none")
            updateBlogs.classList.add("d-none")
        })
        .catch(err => {
            snackbar("Failed to update blog !!!", "error")
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })

}

function onDelete(ele) {
    let REMOVE_ID = ele.closest(".col-md-4").id;
    let REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    })
        .then((result) => {
            if (result.isConfirmed) {
                showSpinner()

                fetch(REMOVE_URL, {
                    method: "DELETE",
                    body: null,
                    headers: {
                        "Content-type": "application/json"
                    }
                })
                    .then(res => {
                        return res.json()
                    })

                    .then(data => {

                        let getIndex = state.blogsArr.findIndex(b => b.id === REMOVE_ID)
                        state.blogsArr.splice(getIndex, 1)
                        let col = document.getElementById(REMOVE_ID)
                        ele.closest(".col-md-4").remove()
                        snackbar("Blog deleted successfully !!!", "success")
                    })

                    .catch(err => {
                        snackbar(err)
                    })

                    .finally(() => {
                        hideSpinner()
                    })
            }
        })
}


fetchBlogs()

form.addEventListener("submit", onAddBlog)
updateBlogs.addEventListener("click", onUpdate)