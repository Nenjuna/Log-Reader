// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension

let res = [] //temp results
let FinalResults = [] //Actual results
let current_page = 1;
let rows = 20;

// Optios for Lazy loading or Infinite Scroll
let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.5
  };


// Main function which starts the log reading process
window.addEventListener('DOMContentLoaded', () => {
    let list_element = document.getElementById('results') //Display element
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(document.getElementById('trigger'))
    
    
    //Variables declared for the main process
    let searchQuries = ["Exception occured","SEVERE" ,"Exception while getting user credentials"] //Search Queries
    let ThreadNumbers = [] //Thread numbers
    
    
    let pageWindow = 10;
   
    //third party API loading the log files into memory
    const TxtReader = require('txt-reader').TxtReader;

    var btn = document.getElementById('btn') //Button initiating the process
    
    const pagination_element = document.getElementById('pagenumbers') //Pagination element

    window.readText = function(file) {  
        var reader = new TxtReader();
       
        
        reader.loadFile(file)
        .progress(function (progress) {
            // console.log('Loading file progress: ' + progress + '%');
        })
        .then(function (response) {
            // console.log('Loading file completed in ' + response.timeTaken + 'ms, total lines: ' + response.result.lineCount);
            exectueAfterLoadFileComplete();
        })
        .catch(function (reason) {
            // console.log('Loading file failed with error: ' + reason);
        });
    //This function will be executed after the file is completely loaded
    function exectueAfterLoadFileComplete() {
        reader.getLines(1, 1000000)
            .progress(function (progress) {
                // console.log('Getting lines progress: ' + progress + '%');
            })
            .then(function (response) {
                console.log(response.result.length);
                let temp = response.result;
                // let pat = /\[\d{2}:\d{2}:\d{2}:\d{3}\]/;
                let slide = 0;
                temp.forEach((i)=>{
                    if(!(i.startsWith("["))){                  
                        res[slide -1] = res[slide-1] + i
                    } else{
                        res[slide] = i;
                        slide++                  
                    }})

                for(i in res){
                    for(j in searchQuries){
                        if(!(res[i].search(searchQuries[j])==-1)){
                            let threadnumber = ""
                            let patthree = /\[\d{3}\]/
                            let pattwo = /\[\d{2}\]/
                            let patone = /\[\d{1}\]/
                            var re = new RegExp(pattwo, 'g')
                            // console.log(res[i].match(re))
                            let te = res[i].match(re)
                            threadnumber = (te==null) ?  '[00]' : te[0];
                            let classSearch = res[i].split('|') //Class finder
                            // console.log(classSearch)
                            // console.log(threadnumber)
                            // console.log(threadnumber.length)
                            // console.log(threadnumber.slice(1,threadnumber.length-1))
                            ThreadNumbers.push(threadnumber.slice(1,threadnumber.length-1))
                            // console.log(ThreadNumbers)
                            break
                        }
                    }
                }
                let uniqueThreadNumbers = [...new Set(ThreadNumbers)];
                // console.log(uniqueThreadNumbers)

                for(i in res){
                    for(j in uniqueThreadNumbers){
                        if(!(res[i].search(uniqueThreadNumbers[j])==-1)){
                            FinalResults.push(res[i])
                        }
                        break
                    }
                }

                // console.log(FinalResults.length)
                // console.log(res.length)
                // console.log(response.results.length)
                console.log(current_page)
                getData();
                // displayList(FinalResults, list_element,rows,current_page);
           
                // pagination(FinalResults, current_page, rows)
                
            })
            .catch(function (reason) {
                console.log('Getting lines failed with error: ' + reason);
            });
    
        reader.iterateLines({
            eachLine: function (raw, progress, lineNumber) {
                if (this.contains2018(raw)) {
                    this.count++;
                }
            },
            scope: {
                count: 0,
                contains2018: function(raw) {
                    return this.decode(raw).indexOf('2018') > -1;
                }
            }
        })
            .progress(function (progress) {
                // console.log('Iterating lines progress: ' + progress + '%');
            })
            .then(function (response) {
                // console.log(response.result.count + ' lines contain "2018"');
            })
            .catch(function (reason) {
                // console.log('Iterating lines failed with error: ' + reason);
            });

    

    }
    
            reader.utf8decoder.decode(new Uint8Array(['a'.charCodeAt(0)])) === 'a'
            }

            

            btn.addEventListener("click", ()=>{
                
                var file = document.getElementById('file-input').files;
                // console.log("CLick")
                // console.log(file.length)
                for(let i = 0; i< file.length; i++){
                    // console.log(file[i])
                    readText(file[i])
                    current_page = 1;
                }
            
            })



            function displayList (items, wrapper, rows_per_page, page){
                // console.log(wrapper)

                // wrapper.innerHTML = ""
                page--;

                let start = rows_per_page * page;
                let end = start + rows_per_page;
                let paginatedItems = items.slice(start, end)

                for(let i =0 ; i< paginatedItems.length; i++){
                    let item = paginatedItems[i];
                    let item_element = document.createElement('div')
                    item_element.classList.add('item')
                    if(item.search('WARNING')> -1) item_element.classList.add('warning')
                    if(item.search('SEVERE') > -1) item_element.classList.add('severe')
                    if(item.search('INFO') > -1) item_element.classList.add('info')
                    item_element.innerText= item
                    wrapper.appendChild(item_element)
                }
                current_page++ 
                // SetupPagination(FinalResults, pagination_element, rows);
            }

   


            function handleIntersect(entries){
                if (entries[0].isIntersecting) {
                    console.log("something is intersecting with the viewport");
                    getData();
                  }
            }
            
            function getData(){
                let list_element = document.getElementById('results') 
                // let list_element = document.querySelector("main"); //Display element
                console.log("fetch some JSON data");
                displayList(FinalResults, list_element,rows,current_page);
                
                console.log(current_page)                
            }
          
})



window.addEventListener('DOMContentLoaded', ()=>{
    // Setting up Search tags in the search bar
    [].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
        let hiddenInput = document.createElement('input'),
            mainInput = document.createElement('input'),
            searchButton = document.createElement('button'),
            tags = [];
        
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', el.getAttribute('data-name'));
    
        mainInput.setAttribute('type', 'text');
        mainInput.setAttribute('placeholder', 'Add Tags...')
        mainInput.classList.add('main-input');
        searchButton.setAttribute('type', 'submit')
        searchButton.classList.add('search-button')
        searchButton.innerHTML = '<i class="material-icons">search</i>'
        mainInput.addEventListener('input', function () {
            let enteredTags = mainInput.value.split(',');
            if (enteredTags.length > 1) {
                enteredTags.forEach(function (t) {
                    let filteredTag = filterTag(t);
                    if (filteredTag.length > 0)
                        addTag(filteredTag);
                });
                mainInput.value = '';
            }
        });
    
        mainInput.addEventListener('keydown', function (e) {
            let keyCode = e.which || e.keyCode;
            if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
                removeTag(tags.length - 1);
            }
        });
    
        el.appendChild(mainInput);
        el.appendChild(hiddenInput);
        el.appendChild(searchButton)
        
       
        // addTag('hello!');
    
        function addTag (text) {
            let tag = {
                text: text,
                element: document.createElement('span'),
            };
    
            tag.element.classList.add('tag');
            tag.element.textContent = tag.text;
    
            let closeBtn = document.createElement('span');
            closeBtn.classList.add('close');
            closeBtn.addEventListener('click', function () {
                removeTag(tags.indexOf(tag));
            });
            tag.element.appendChild(closeBtn);
    
            tags.push(tag);
    
            el.insertBefore(tag.element, mainInput);
    
            refreshTags();
        }
    
        function removeTag (index) {
            let tag = tags[index];
            tags.splice(index, 1);
            el.removeChild(tag.element);
            refreshTags();
        }
    
        function refreshTags () {
            let tagsList = [];
            tags.forEach(function (t) {
                tagsList.push(t.text);
            });
            hiddenInput.value = tagsList.join(',');
        }
    
        function filterTag (tag) {
            return tag;
        }

        function setUpTabs(){
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', ()=>{
                    const sidebar = button.parentElement;
                    const tabContainer = sidebar.parentElement;
                    const tabVar = button.dataset.forTab;
                    const tabToActive =  tabContainer.querySelector(`.content[data-tab="${tabVar}"]`)

                    sidebar.querySelectorAll('.tab-button').forEach(button =>{
                        button.classList.remove('tab-btn-active')
                    })
                    tabContainer.querySelectorAll('.content').forEach(tab =>{
                        tab.classList.remove('con-active')
                    })
                    button.classList.add('tab-btn-active')
                    tabToActive.classList.add('con-active')


                    console.log(sidebar)
                    console.log(tabContainer);
                    console.log(tabVar);
                    console.log(tabToActive)
                    
                })
            })

        }
        setUpTabs();

    });
})


window.rendererFunction = () => {
    console.log(FinalResults)
}

// static searchPage(event) {
//     if (event.target.value.lenght > 0) {
//         ipcRenderer.send('search-text', event.target.value);
//      }
//     }