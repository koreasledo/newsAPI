let news = [];
let page = 1;
let totalPage = 1;
let url;
let menus = document.querySelectorAll(".menus button");
let searchBtn = document.getElementById("searchBtn");

menus.forEach(menu=> menu.addEventListener("click", (event)=> getNewsByTopic(event)));


// 각 함수에서 필요한 url을 만든다
// api 호출 함수를 부른다

const getNews = async () => {
  try {
    let header = new Headers({
      'x-api-key':'tGoLCzuJtQWz74XoP_zCJ3wGLq9LxJMW3g1Qdf8RpAE'
    });

    //url에 페이지에 대한 정보를 추가하겠다
    url.searchParams.set('page', page);

    //console.log(url);
    let response = await fetch(url,{ headers: header });
    let data = await response.json();
    if(response.status == 200) {
      if(data.total_hits == 0) {
        throw new Error(data.status);
      }
      //console.log("받은 데이터가 뭐지?", data);
      news = data.articles;
      totalPage = data.total_pages;
      page = data.page;
      //console.log(news);
      render();
      pagenation();
    }else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.log("잡힌 에러는 ", error.message);
    errorRender(error.message);
  }
}

const getLatestNews = async() => {
  page = 1;
  url = new URL('https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&topic=sport&page_size=10');
  getNews();
}

const getNewsByTopic = async (event) => {
  let topic = event.target.textContent.toLowerCase();
  page=1;
  url = new URL(`https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&page_size=10&topic=${topic}`);
  getNews();
}

const openSearchBox = () => {
  let inputArea = document.getElementById("inputArea");
  if (inputArea.style.display === "inline") {
    inputArea.style.display = "none";
  } else {
    inputArea.style.display = "inline";
  }
};

const getNewsByKeyword = async () => {
  // 1. 검색 키워드 읽어오기
  // 2. url에 검색 키워드 붙이기
  // 3. 헤더 준비
  // 4. url 부르기
  // 5. 데이터 가져오기
  // 6. 데이터 보여주기

  let keyword = document.getElementById("searchInput").value;
  page = 1;
  url = new URL(`https://api.newscatcherapi.com/v2/search?q=${keyword}&page_size=10' &countries=CA&page_size=1`);
  getNews();
}

const render = () => {
  let newsHTML = '';
  newsHTML= news.map((item)=>{
    return `<div class="row news">
    <div class="col-lg-4">
      <img class="newsImgSize" src="${item.media || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU'}">
    </div>
    <div class="col-lg-8">
      <a class="title" target"_blank" href="${item.link}">${item.title}</a>
      <p>
        ${ 
          item.summary == null || item.summary == "" 
          ? "내용없음"
          : item.summary.length > 200
          ? item.summary.substring(0,200) + "..."
          : item.summary
        }
      </p>
      <div>
        ${item.rights || "no source"} * ${moment(item.published_date).fromNow()} 
      </div>
    </div>
  </div>`;
  }).join('');

  document.getElementById("newsBoard").innerHTML = newsHTML;
};

const errorRender = (message) => {
  let errorHTML = `<div class="alert alert-danger text-center" role="alert">${message}</div>`;
  document.getElementById("newsBoard").innerHTML = errorHTML;
}

// page 정보 기준으로 내가 몇번째 그룹인지 안다
// Math.ceil(page / 5);
// 그 그룹의 첫번째와 마지막 페이지를 안다
// 첫번째~ 마지막 페이지까지 그려준다. 11 12 13 14 15

const pagenation = () => {
  // 1.1~5까지를 보여준다
  // 2.6~10을 보여준다 => last, first 가필요
  // 3.만약에 first가 6 이상이면 prev 버튼을 단다
  // 4.만약에 last가 마지막이 아니라면 next버튼을 단다
  // 5.마지막이 5개이하이면 last=totalpage이다
  // 6.페이지가 5개 이하라면 first = 1이다

  let pagenationHTML = ``;
  let pageGroup = Math.ceil(page/5);
  let lastPage = pageGroup * 5;
  if (lastPage > totalPage) {
    lastPage = totalPage;
  }
  let firstPage = lastPage - 4 <=0 ? 1: lastPage - 4;

  if (firstPage >= 6) {
    pagenationHTML =
      `<li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(1)">
          <span aria-hidden="true">&lt;&lt;</span>
        </a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous" onclick="moveToPage(${page -1})">
          <span aria-hidden="true">&lt;</span>
        </a>
      </li>`;
  }

  for (let i = firstPage; i <= lastPage; i++) {
    pagenationHTML += `<li class="page-item ${page == i ? "active": ""}"><a class="page-link" href="#" onclick="moveToPage(${i})">${i}</a></li>`;
  }

  if (lastPage < totalPage ) {

  pagenationHTML += 
    `<li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${page +1})">
        <span aria-hidden="true">&gt;</span>
      </a>
    </li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" onclick="moveToPage(${totalPage})">
        <span aria-hidden="true">&gt;&gt;</span>
      </a>
    </li>`;
  }
  
  document.querySelector(".pagination").innerHTML = pagenationHTML;
};

const moveToPage = (pageNum) => {
  //1. 이동하고 싶은 페이지를 알아야 한다
  page = pageNum;
  window.scrollTo({top: 0, behavior: "smooth"});
  //2. 이동하고 싶은 페이지를 가지고 api를 다시 호출해줘야 한다
  getNews();
}


searchBtn.addEventListener("click", getNewsByKeyword);
getLatestNews();

const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};