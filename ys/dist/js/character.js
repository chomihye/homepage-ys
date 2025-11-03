$(document).ready(function () {
    const popup = $(".popup");
    const popupTitle = $(".popup-title");
    const popupAuthor = $(".popup-author");
    const popupCategory = $(".popup-category");
    const popupOverlay = $(".popup-overlay");
    const closeBtn = $(".popup-close .close");

    // 이미지 클릭 시 팝업 열기
    $(".img-item img").on("click", function () {
        const parent = $(this).closest(".img-item"); // 클릭한 이미지의 부모
        const title = parent.data("title");
        const category = parent.data("category");
        const client = parent.data("client");

        // 팝업 내용 채우기
        popupTitle.text(title);
        popupAuthor.text(client);
        popupCategory.text(category);

        // 팝업 열기
        popupOverlay.addClass("active");

        //닫기
        closeBtn.on("click", function () {
            popupOverlay.removeClass("active");
        });
        popupOverlay.on("click", function () {
            popupOverlay.removeClass("active");
        });
    });

    //모바일헤더
    const mobileMenu = $(".mobile-menu");
    const btnClose = $(".mobile-close-btn");
    const menuBtn = $(".menu-btn");

    menuBtn.on("click", function () {
        mobileMenu.addClass("active");
    });

    btnClose.on("click", function () {
        mobileMenu.removeClass("active");
    });

    const dataUrl = "./data/data.json";
    const imgGrid = $(".img-grid");
    let allData = [];

    const itemsPerLoad = 4; // "더보기"로 추가되는 개수는 4개
    let currentViewData = [];
    let loadedItemCount = 12;

    const loadMoreBtn = $(".more-btn");

    //html 추가
    function renderItems(list) {
        imgGrid.empty();

        $.each(list, function (index, item) {
            const clientHtml = item.client ? `<span class="bar-gy"></span><span class="category">${item.client}</span>` : "";
            const itemHtml = `
                <div class="img-item">
                    <div class="img-item-wrap">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="img-title">
                        ${item.title}
                        <span class="bar-gy"></span>
                        <span class="category">${item.category}</span>
                        ${clientHtml} 
                    </div>
                </div>
            `;
            imgGrid.append(itemHtml);
        });
    }

    function loadMoreItems() {
        loadedItemCount = 12;
        const itemsToShow = currentViewData.slice(0, loadedItemCount);
        renderItems(itemsToShow);
    }

    $.getJSON(dataUrl, function (data) {
        allData = data;
        const tabMenu = $(".tab-menu");
        const scopeAttr = tabMenu.data("scope");

        tabMenu.filter('[data-scope="character,illustration"]').addClass("active");
        let pageData = [];

        if (scopeAttr) {
            const scopeList = scopeAttr.split(",").map((item) => item.trim());
            pageData = allData.filter((item) => scopeList.includes(item.tab));
        } else {
            pageData = allData;
        }

        const tabButtons = tabMenu.find("button");
        tabButtons.filter('[data-filter="all"]').addClass("active");

        tabButtons.on("click", function () {
            tabButtons.removeClass("active");
            $(this).addClass("active");
            const filter = $(this).data("filter");

            if (filter === "all") {
                currentViewData = pageData;
            } else {
                currentViewData = pageData.filter((item) => item.tab === filter);
            }

            loadedItemCount = 12; // 탭 클릭 시 12개로 리셋

            // 12개 '비우고 새로 그림'
            renderItems(currentViewData.slice(0, loadedItemCount));
        });

        loadMoreBtn.on("click", loadMoreItems);

        // --- 6. 페이지 첫 로드 시 초기화 실행 ---
        currentViewData = pageData;
        loadedItemCount = 12; // 첫 로드 12개

        // 12개 '비우고 새로 그림'
        renderItems(currentViewData.slice(0, loadedItemCount));
    });
});
