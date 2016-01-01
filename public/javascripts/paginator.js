 var Paginator = (function(){

     function Pager() {
       this.elementsPerPage;
       this.currentPage,
       this.table,
       this.pagerContainer;

       this.init = function init(tableId, pagerId, elements){
         this.table = document.querySelector(tableId);
         if (!this.table) return;
         this.pagerContainer = document.querySelector(pagerId);
         this.elementsPerPage = elements;
         // pages start with 0. Just like 0 index arrays
         this.currentPage = 0;

         this.updateTable(0, this.elementsPerPage);
       }

       this.updateTable = function updateTable(startRow, endRow){
         var rows = this.table.querySelectorAll('tbody tr');

         for (var i = 0, l = rows.length; i < l; i++) {
           if (i < startRow  || i >= endRow) {
             rows[i].style.display = 'none';
           } else {
             rows[i].style.display = '';
           }
         }
         this.updatePager(rows.length, this.currentPage);
       }

       this.updatePager = function updatePager(rows, currentPage){

         var nodes = this.pagerContainer.querySelectorAll('a');
         for (var i=0, l = nodes.length; i< l; i++) {
           var node = nodes[i];
           node.parentNode.removeChild(node);
         }

         var nbPages = Math.ceil(rows / this.elementsPerPage);

         if (currentPage != 0) { //no previous if first page
           var previousPager = document.createElement('a');
           previousPager.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--fab';
           previousPager.innerHTML = '<i class="material-icons">keyboard_arrow_left</i>';
           this.addPagerListener(previousPager, 'previous');
           componentHandler.upgradeElement(previousPager);
           this.pagerContainer.appendChild(previousPager);
         }

         for (var i=0; i< nbPages; i++) {
           var pager = document.createElement('a');
           if (currentPage == i) {
             pager.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary mdl-button--fab';
            } else {
              pager.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--fab';
            }
            pager.innerHTML = i + 1;
            this.addPagerListener(pager, 'pageNumber', i);
            componentHandler.upgradeElement(pager);
            this.pagerContainer.appendChild(pager);
         }

         if (currentPage < nbPages - 1) { //no next if it's the last page
           var nextPager = document.createElement('a');
           nextPager.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--fab';
           nextPager.innerHTML = '<i class="material-icons">keyboard_arrow_right</i>';
           this.addPagerListener(nextPager, 'next');
           componentHandler.upgradeElement(nextPager);
           this.pagerContainer.appendChild(nextPager);
         }
       }

       this.addPagerListener = function addPagerListener(pager, action, pageNumber) {
         var paginator = this;
         pager.addEventListener('click', function (event) {
           event.preventDefault();
           switch (action) {
             case 'next': paginator.next();
             break;
             case 'previous': paginator.previous();
             break;
             case 'pageNumber': paginator.showPage(pageNumber);
             break;
             default:
               console.log('Unkown action');
           }
         });
       }

       this.next = function next(){
         this.currentPage++;
         var startRow = this.currentPage * this.elementsPerPage;
         this.updateTable(startRow, startRow + this.elementsPerPage);
       }

       this.previous = function previous(){
         this.currentPage--;
         var startRow = this.currentPage * this.elementsPerPage;
         this.updateTable(startRow, startRow + this.elementsPerPage);
       }

       this.showPage = function showPage(pageNumber) {
         this.currentPage = pageNumber;
         var startRow = this.currentPage * this.elementsPerPage;
         this.updateTable(startRow, startRow + this.elementsPerPage);
       }
     }

   return {
      init : function (tableId, pagerId, elements) {
        var pager = new Pager();
        pager.init(tableId, pagerId, elements);
      }
   }

  })();

window.Paginator = Paginator;


