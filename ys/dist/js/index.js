$(document).ready(function () {
    gsap.registerPlugin(ScrollTrigger);

    //스크롤시 헤더 변경
    const path = window.location.pathname;
    const header = $("header");
    const mainLogo = $(".main-logo img");
    const btnInvert = $(".btn-invert");
    const icRight = $(".right");

    if (path === "/" || path === "/index.html") {
        //초기 상태
        header.addClass("start");
        mainLogo.attr("src", "../../assets/img/logo-w.png");
        btnInvert.addClass("btn-white");
        icRight.removeClass("ic-right-w").addClass("ic-right");

        $(window).on("scroll", function () {
            const scrolled = $(this).scrollTop() > 0;

            header.toggleClass("scroll", scrolled).toggleClass("start", !scrolled);

            mainLogo.attr("src", scrolled ? "../../assets/img/logo-b.png" : "../../assets/img/logo-w.png");

            btnInvert.toggleClass("btn-black", scrolled).toggleClass("btn-white", !scrolled);

            icRight.toggleClass("ic-right-w", scrolled).toggleClass("ic-right", !scrolled);
        });
    }

    //글자 변경
    const text = [
        "영성미디어 주식회사는 1999년 설립 후 교육관련 기관의 교육용 콘텐츠를 제작해오고 있으며",
        "디지털 교과서 및 전자저작물 전문 제작업체로서 공교육 지원용 교육 콘텐츠 개발에 앞장서는",
        "대한민국 대표 교육용 멀티미디어 콘텐츠 제작 전문기업입니다"
    ];
    let index = 0;
    const el = $("#change-text");
    if (el) {
        el.html(text[index]);
    }

    setInterval(() => {
        el.addClass("fade-out");
        setTimeout(() => {
            index = (index + 1) % text.length;
            el.html(text[index]);
            el.removeClass("fade-out");
        }, 800);
    }, 3000);

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

    //아코디언 메뉴
    $(".business .box").on("click", function () {
        $(this).find(".box-content").toggleClass("active");
    });

    //이미지 넣기
    const dataUrl = "/data/data.json";
    const imgGrid = $(".img-grid");
    let allData = [];
    const tabMenu = $(".tab-menu");

    function renderItems_ADD(list) {
        $.each(list, function (index, item) {
            const hasVideo = item.video ? true : false;
            const clientHtml = item.client ? `<span class="bar-gy"></span><span class="category">${item.client}</span>` : "";
            const playBtn = hasVideo ? `<span class="ic-play"></span>` : "";
            const videoDataAttr = hasVideo ? `data-video-src="${item.video}"` : "";
            const itemHtml = `
                <div class="img-item" ${videoDataAttr}>
                    <div class="img-item-wrap">
                        <img src="${item.image}" alt="${item.title}">
                         ${playBtn}
                    </div>
                    <div class="img-title">
                        ${item.title}
                        <span class="bar-gy"></span>
                        <span class="category">${item.category}</span>
             
                    </div>
                </div>
            `;
            imgGrid.append(itemHtml);
        });
    }

    function renderItems_REPLACE(list) {
        imgGrid.empty(); // 1. 먼저 비우고
        renderItems_ADD(list); // 2. '추가' 함수를 호출해 그린다
    }

    $.getJSON(dataUrl, function (data) {
        allData = data;

        // --- 5. 페이지 모드 감지 ---
        const mainPageLinkBtn = $(".more-portfolio"); // 메인 페이지 '페이지 이동' 버튼
        const subPageLoadBtn = $(".more-btn"); // 서브 페이지 '+ 더보기' 버튼

        // ---------------------------------
        // [A] 메인 페이지 모드 (index.html)
        // ---------------------------------
        if (mainPageLinkBtn.length > 0) {
            const pageData = allData; // 메인 페이지는 항상 모든 데이터를 다룸
            const tabButtons = tabMenu.find("button");

            // 1. 초기 로드 (12개만)
            renderItems_REPLACE(pageData.slice(0, 12));
            mainPageLinkBtn.hide(); // '전체' 탭에선 숨김
            tabButtons.filter('[data-filter="all"]').addClass("active");

            // 2. 탭 클릭 이벤트 (메인 페이지용)
            tabButtons.on("click", function () {
                tabButtons.removeClass("active");
                $(this).addClass("active");

                const filter = $(this).data("filter");
                const link = $(this).data("link"); // ⭐️ data-link 속성을 읽음

                // '페이지 이동' 버튼 링크 및 표시/숨김 처리
                if (filter === "all" || !link) {
                    mainPageLinkBtn.hide();
                } else {
                    mainPageLinkBtn.show();
                    mainPageLinkBtn.attr("href", link); // ⭐️ 읽어온 link를 href에 설정
                }

                // 필터링
                let filteredList = [];
                if (filter === "all") {
                    filteredList = pageData;
                } else {
                    filteredList = pageData.filter((item) => item.tab === filter);
                }

                // 렌더링 (항상 12개만)
                renderItems_REPLACE(filteredList.slice(0, 12));
            });
        }

        // ---------------------------------
        // [B] 서브 페이지 모드 (character.html 등)
        // ---------------------------------
        else if (subPageLoadBtn.length > 0) {
            const itemsPerLoad = 4; // "더보기"로 4개씩 추가
            let currentViewData = []; // 현재 탭/페이지의 데이터
            let loadedItemCount = 0; // 현재 로드된 개수

            // "+ 더보기" 클릭 시 실행될 함수
            function loadMoreItems() {
                const currentCount = loadedItemCount;
                loadedItemCount += itemsPerLoad;
                const itemsToAppend = currentViewData.slice(currentCount, loadedItemCount);
                renderItems_ADD(itemsToAppend); // '추가'만 함
            }

            // --- 서브 페이지 데이터 범위 설정 ---
            let pageData = [];

            if (tabMenu.length > 0) {
                // B-1: 탭이 있는 서브 페이지 (character.html)
                const scopeAttr = tabMenu.data("scope");
                if (scopeAttr) {
                    const scopeList = scopeAttr.split(",").map((item) => item.trim());
                    pageData = allData.filter((item) => scopeList.includes(item.tab));
                } else {
                    pageData = allData; // (data-scope가 없는 예외 처리)
                }

                const tabButtons = tabMenu.find("button");
                tabButtons.filter('[data-filter="all"]').addClass("active");

                // 탭 클릭 이벤트 (서브 페이지용)
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
                    renderItems_REPLACE(currentViewData.slice(0, loadedItemCount));
                });
            } else {
                // B-2: 탭이 없는 서브 페이지 (animation.html)
                const pageFilter = imgGrid.data("page-filter");
                if (pageFilter) {
                    pageData = allData.filter((item) => item.tab === pageFilter);
                } else {
                    pageData = allData; // (예외 처리)
                }
            }

            // --- 서브 페이지 공통 초기화 ---
            currentViewData = pageData;
            loadedItemCount = 12; // 첫 로드는 12개
            renderItems_REPLACE(currentViewData.slice(0, 12)); // 12개 '비우고 새로' 그림

            // "+ 더보기" 버튼에 클릭 이벤트 연결
            subPageLoadBtn.on("click", loadMoreItems);
        }

        // (C) 탭도 버튼도 없는 페이지는 아무것도 하지 않음
    }).fail(function () {
        console.error("JSON 파일을 불러오는 데 실패했습니다.");
        imgGrid.html("<p>데이터를 불러올 수 없습니다.</p>");
    });

    //팝업 슬라이드
    const popup = $(".popup");
    const popupTitle = $(".popup-title");
    const popupAuthor = $(".popup-author");
    const popupCategory = $(".popup-category");
    const popupOverlay = $(".popup-overlay");
    const closeBtn = $(".popup-close .close");
    const videoPopup = $(".popup-overlay.video");

    // 이미지 클릭 시 팝업 열기
    imgGrid.on("click", ".img-item img", function () {
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
        popupOverlay.on("click", function (e) {
            if ($(e.target).is(".popup-overlay")) {
                popupOverlay.removeClass("active");
            }
        });
    });

    //문의페이지 제출하기
    const submitBtn = $(".submit-btn");
    const submitPopup = $(".submit-popup");
    const submitPopupOverlay = $(".submit-popup-overlay");

    submitBtn.on("click", function () {
        submitPopupOverlay.addClass("active");
    });
    $(".submit-popup-btn").on("click", function () {
        submitPopupOverlay.removeClass("active");
    });

    //영상 플레이
    const playBtn = $(".img-item .img-item-wrap .ic-play");

    imgGrid.on("click", ".ic-play", function () {
        const parent = $(this).closest(".img-item"); // 클릭한 이미지의 부모
        console.log(parent);
    });

    //스크롤

    gsap.registerPlugin(ScrollTrigger);

    const items = gsap.utils.toArray(".timeline-item");
    const circles = gsap.utils.toArray(".timeline-item .circle");

    if (items.length === 0 || circles.length === 0) return;

    // 1. 빨간색 라인 애니메이션
    gsap.to(".timeline-progress", {
        clipPath: "inset(0 0 0% 0)", // ◀ 'clip-path'로 애니메이션
        ease: "none", // ◀ 'ease: "none"' (선형) 필수!

        scrollTrigger: {
            trigger: circles[0],
            start: "center center", // ◀ 기준: 첫 번째 점의 '중앙'
            endTrigger: circles[circles.length - 1],
            end: "center center", // ◀ 기준: 마지막 점의 '중앙'
            scrub: true, // ◀ 'scrub: true' (즉각 반응) 필수!
            markers: false
        }
    });

    // 2. 각 타임라인 아이템 활성화
    items.forEach((item) => {
        const circleEl = item.querySelector(".circle");

        if (circleEl) {
            gsap.to(item, {
                scrollTrigger: {
                    trigger: circleEl,
                    start: "center center", // ◀ 기준: 각 점의 '중앙' (라인과 동일)

                    onEnter: () => item.classList.add("active"),
                    onLeaveBack: () => item.classList.remove("active"),
                    markers: false
                }
            });
        }
    });
});
