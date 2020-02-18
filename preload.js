// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension

let res = [] //temp results
let FinalResults = [] //Actual results
let SearchResults = []
let current_page = 1;
let rows = 40;
let search_page = 1;

//Display element

// Optios for Lazy loading or Infinite Scroll
let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.5
  };


// Main function which starts the log reading process
window.addEventListener('DOMContentLoaded', () => {
    let list_element = document.getElementById('results') 
    let search_results = document.getElementById('searched-results')
    
    
    // Intersection Observer for lazy loading in all results
    const observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(document.getElementById('trigger'))
    const searchObserver = new IntersectionObserver(handleSearchIntersection, options)
    searchObserver.observe(document.getElementById('search-trigger'))
    
    
    
    //Variables declared for the main process
    // let searchQuries = ["Exception occured","SLA Escalation Started", "MSSQL Kindly use proper column alias"] //Search Queries
    let searchQuriesUser = document.getElementById('tags-input')

    let searchQuries = ["Exception occured","SLA Escalation Started", "MSSQL Kindly use proper column alias"]
    let probClassNames = [] // Probablamatic class
    
    
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
        reader.getLines(1, 1000000000000000000000000000000)
            .progress(function (progress) {
                // console.log('Getting lines progress: ' + progress + '%');
            })
            .then(function (response) {
                // console.log(response.result.length);
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

                for(j in searchQuries){
                    for(i in res){
                        // console.log(i)
                        if(!(res[i].search(searchQuries[j])==-1)){
                            let probClass = ""
                            let classSearch = res[i].split('|') 
                            // console.log(classSearch)
                            // var re = new RegExp(pattwo, 'g')
                            // console.log(res[i].search(classSearch[2]))
                            // console.log(classSearch[2])
                            // console.log(res[i])
                            let temp = res[i].search(classSearch[2])
                            // console.log(typeof(temp))
                            // console.log(!(temp==-1))
                            probClass = (!(temp==-1)) ? classSearch[2] : "[no.Class.Found]" ;
                            // console.log(i)

                            // probClass = temp
                            //Class finder
                            // console.log(classSearch)
                            // console.log(threadnumber)
                            // console.log(threadnumber.length)
                            // console.log(threadnumber.slice(1,threadnumber.length-1))
                            probClassNames.push(probClass.slice(1,probClass.length-1))
                            // console.log(probClassNames)
                            break
                        }
                    }
                }
                let uniqueprobClassNames = [...new Set(probClassNames)];
                console.log(uniqueprobClassNames)

                for(i in res){
                    for(j in uniqueprobClassNames){
                        if(!(res[i].search(uniqueprobClassNames[j])==-1)){
                            FinalResults.push(res[i])
                        }
                        // break
                    }
                }

                // console.log(FinalResults.length)



                // console.log(FinalResults.length)
                // console.log(res.length)
                // console.log(response.results.length)
                // console.log(current_page);
                // getData();
                // displayList(FinalResults, list_element,rows,current_page);
           
                // pagination(FinalResults, current_page, rows)
                
            })
            .catch(function (reason) {
                console.log('Getting lines failed with error: ' + reason);
            });
    

    }
    
            reader.utf8decoder.decode(new Uint8Array(['a'.charCodeAt(0)])) === 'a'
            }

            
            // Trigger function
            btn.addEventListener("click", async ()=>{
                
                // var file = document.getElementById('file-input').files;
                // // console.log("CLick")
                // // console.log(file.length)
                // for(let i = 0; i< file.length; i++){
                //     // console.log(file[i])
                //     await readText(file[i])
                //     current_page = 1;
                //     // console.log(FinalResults);
                    
                // }
                console.log(FinalResults.length);
                document.querySelectorAll('.main').forEach(tabContainer=>{

                    // console.log(tabContainer)
        
                    // tabContainer.querySelector('.sidebar .tab-button').click()
                    tabContainer.querySelectorAll('.sidebar .tab-button')[1].click()
                    getData(FinalResults,list_element,rows,current_page);
                    current_page++ 

                })

            
            });

            // Auto trigger
            let files_button = document.getElementById('file-input')
            files_button.addEventListener("change", function() {
                if (files_button.value) {
                  //   console.log(realFileBtn)
                  let val = files_button.files;
                  console.log(val)
                  for(let i = 0; i< val.length; i++){
                    // console.log(val[i])
                    readText(val[i])
                    // current_page = 1;
                    // console.log(FinalResults);
                    
                }
                    // customTxt.innerHTML = "File(s) selected"
                  // customTxt.innerHTML = realFileBtn.value.match(
                  //   /[\/\\]([\w\d\s\.\-\(\)]+)$/
                  // )[1];
                } else {
                //   customTxt.innerHTML = "No file chosen, yet.";
                }
              });

             




            function displayList (items, wrapper, rows_per_page, page){
                // console.log(wrapper)

                // wrapper.innerHTML = ""
                page--;
                // console.log(items.length)
                // console.log(wrapper)

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
               
                // SetupPagination(FinalResults, pagination_element, rows);
            }

   


            function handleIntersect(entries){
                if (entries[0].isIntersecting) {
                    console.log("something is intersecting with the viewport");
                    // getData();
                    getData(FinalResults,list_element,rows,current_page);
                    current_page++ 

                  }
            }

            function handleSearchIntersection(entries){

                if(entries[0].isIntersecting){
                    console.log('Something is messing the search results page')
                    getData(SearchResults,search_results,rows,search_page);
                    search_page++;

                }
            }

            
            
    // Setting up Search tags in the search bar
    [].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
        let hiddenInput = document.createElement('input'),
            mainInput = document.createElement('input'),
            searchButton = document.createElement('button'),
            tags = [];
        // Hidden input to get all values for searching the array
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', el.getAttribute('data-name'));
        hiddenInput.setAttribute('id', 'tags-input');
        
        //Main input function FOR JUST DISPLAY AND GETTING inputs
        mainInput.setAttribute('type', 'text');
        mainInput.setAttribute('placeholder', 'Add Tags...')
        mainInput.classList.add('main-input');
        searchButton.setAttribute('type', 'submit')
        searchButton.setAttribute('id', 'searchbutton')
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
    
        // Keyboard event tracker
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

        let search_button = document.getElementById('searchbutton') // Search icon on the header
        // Adding listener to enable the search and changing the view to the search results
        search_button.addEventListener('click', ()=>{
            // SearchResults = []
            searchData();
            document.getElementById('search-results').click();
        })

        // Tabs implementation
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
                    // console.log(sidebar)
                    // console.log(tabContainer);
                    // console.log(tabVar);
                    // console.log(tabToActive)
                    
                })
            })

        }
        setUpTabs();

        //Triggering first tab
        document.querySelectorAll('.main').forEach(tabContainer=>{

            // console.log(tabContainer)

            tabContainer.querySelector('.sidebar .tab-button').click()
            // console.log(tabContainer.querySelectorAll('.sidebar .tab-button'))
        })

    });
    function getData(items, element, rows, page){
        // let list_element = document.getElementById('results') 
        // let list_element = document.querySelector("main"); //Display element
        // console.log("fetch some JSON data");
        displayList(items,element,rows,page)
        // displayList(FinalResults, list_element,rows,current_page);        
        // console.log(current_page)                
    }

    function searchData(){
        // current_page = 1

        SearchResults.length = 0
        search_results.innerHTML = ""
        search_page = 0

        let search_element = document.getElementById('tags-input')
        // let search_results = document.getElementById('searched-results')
        // console.log(res)
        let search_queries = search_element.value.split(',')
        console.log(search_queries)

        let found = []

        search_queries.forEach((query)=>{
        //    found.push(searchItems(query, res))
            found = found.concat(searchItems(query, res))

            // console.log(searchItems(query, res));
            
        })



        SearchResults = SearchResults.concat(found)

        console.log(SearchResults)

        getData(SearchResults,search_results,rows,search_page);
        search_page++;

        // console.log(found)
        
        // return found
        // searchItems(uniqueprobClassNames, res)

    }

    function searchItems(query, res){

        let found = []
        res.forEach((res)=> {

            if(!(res.search(query)==-1)){
                // console.log(res)
                found.push(res)
                // FinalResults.push(res[i])
            }
        })
        return found;

    }
          
})




// Custom input file and some buttons to begin with
window.addEventListener('DOMContentLoaded', ()=>{

const realFileBtn = document.getElementById("file-input");
const customBtn = document.getElementById("choose-files");
const customTxt = document.getElementById("custom-text");

customBtn.addEventListener("click", function() {
  realFileBtn.click();
});

realFileBtn.addEventListener("change", function() {
  if (realFileBtn.value) {
    //   console.log(realFileBtn)
      customTxt.innerHTML = "File(s) selected"
    // customTxt.innerHTML = realFileBtn.value.match(
    //   /[\/\\]([\w\d\s\.\-\(\)]+)$/
    // )[1];
  } else {
    customTxt.innerHTML = "No file chosen, yet.";
  }
});
    
})




// static searchPage(event) {
//     if (event.target.value.lenght > 0) {
//         ipcRenderer.send('search-text', event.target.value);
//      }
//     }