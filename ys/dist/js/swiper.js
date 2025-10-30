// $(document).ready(function () {
//     let mySwiper = null;

//     function hideSwiper() {
//         const screenWidth = $(window).width();

//         // 화면이 768px 이하일 때 (모바일)
//         if (screenWidth <= 768) {
//             if (mySwiper !== null) {
//                 mySwiper.destroy(true, true);
//                 mySwiper = null;
//             }
//         }
//         // 화면이 768px 초과일 때 (데스크톱)
//         else {
//             if (mySwiper === null) {
//                 mySwiper = new Swiper(".mySwiper", {
//                     loop: true,
//                     autoplay: {
//                         delay: 3000,
//                         disableOnInteraction: false
//                     },
//                     // 페이지네이션
//                     pagination: {
//                         el: ".swiper-pagination",
//                         clickable: true
//                     },
//                     slidesPerView: "auto",
//                     spaceBetween: 8,
//                     centeredSlides: true
//                 });
//             }
//         }
//     }

//     // 1. 페이지가 처음 로드될 때 함수를 실행
//     hideSwiper();

//     // 2. 브라우저 창 크기가 변경될 때마다 함수를 다시 실행
//     $(window).on("resize", function () {
//         hideSwiper();
//     });
// });
