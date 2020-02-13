// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension

let res = [] //temp results
let FinalResults = [] //Actual results


// Main function which starts the log reading process
window.addEventListener('DOMContentLoaded', () => {
    //Variables declared for the main process
    let searchQuries = ["SLA","SEVERE","SYSERR" ,"WARNING"] //Search Queries
    let ThreadNumbers = [] //Thread numbers
    
    let pageWindow = 10;
    let current_page = 1;
    let rows = 20;
    //third party API loading the log files into memory
    const TxtReader = require('txt-reader').TxtReader;

    var btn = document.getElementById('btn') //Button initiating the process
    const list_element = document.getElementById('results') //Display element
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


                displayList(FinalResults, list_element,rows,current_page);
           
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
                }
            
            })



            function displayList (items, wrapper, rows_per_page, page){
                // console.log(wrapper)

                wrapper.innerHTML = ""
                page--;

                let start = rows_per_page * page;
                let end = start + rows_per_page;
                let paginatedItems = items.slice(start, end)

                for(let i =0 ; i< paginatedItems.length; i++){
                    let item = paginatedItems[i];
                    let item_element = document.createElement('div')
                    item_element.classList.add('item')
                    if(item.search('WARNING')>-1) item_element.classList.add('warning')
                    if(item.search('SEVERE') > -1) item_element.classList.add('severe')
                    if(item.search('INFO') > -1) item_element.classList.add('info')
                    item_element.innerText= item
                    wrapper.appendChild(item_element)
                }
                SetupPagination(FinalResults, pagination_element, rows);

            }

            function SetupPagination (items, wrapper, rows_per_page) {
                wrapper.innerHTML = "";
               
                let page_count = Math.ceil(items.length / rows_per_page);
                console.log(page_count)
                var maxLeft = (current_page - Math.floor(pageWindow/ 2))
                var maxRight = (current_page + Math.floor(pageWindow / 2))
                if (maxLeft < 1) {
                    maxLeft = 1
                    maxRight = pageWindow
                }
            
                if (maxRight >  page_count) {
                    maxLeft =  page_count - (pageWindow - 1)
                    
                    if (maxLeft < 1){
                        maxLeft = 1
                    }
                    maxRight =  page_count
                }
            



                // for (let i = 1; i < page_count + 1; i++) {
                for (let i = maxLeft; i <= maxRight; i++) {
                    // console.log(i)
                    let btn = PaginationButton(i, items);
                    // console.log(btn)
                    wrapper.appendChild(btn);
                }
            }

            function PaginationButton (page, items) {
                let button = document.createElement('button');
                button.innerText = page;
                if (current_page == page) button.classList.add('active'); 

                button.addEventListener('click', function () {
                    current_page = page;
                    // console.log(page)
                
                    displayList(items, list_element, rows, current_page);

                    // let current_btn = document.querySelector('.pagenumbers button.active');
                    // current_btn.classList.remove('active');

                    button.classList.add('active');
                    
                });
                document.addEventListener('keypress', (e) => {
                    let keycode = e.keyCode
                    console.log(e)
                    if(keycode == 46){
                        keycode = ""
                        current_page = current_page +1
                        displayList(items, list_element, rows, current_page);
                        console.log(current_page)
                        button.classList.add('active');
                    }
                    if(keycode == 44) {
                        keycode = ""
                        current_page = current_page -1
                        displayList(items, list_element, rows, current_page);
                        button.classList.add('active');
                    }

                } , false)

                
               
                // console.log(button)
                return button;
            }

            
           

           

})


window.rendererFunction = () => {
    console.log(FinalResults)
}
