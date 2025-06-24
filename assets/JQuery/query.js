$(document).ready(function () {
    const steps = $(".breadcrumb-item");
    let currentStep = 0;
    const sections = [
        ".plans-page-body",
        "#days-section",
        "#meals-section",
        "#checkout-section"
    ];
    sections.forEach((sel, i) => {
        if (i === 0) {
            $(sel).show();
        } else {
            $(sel).hide();
        }
    });
    steps.each(function (index) {
        if (index > currentStep) {
            $(this).addClass("disabled");
        }
    });
    steps.on("click", function (e) {
        const index = $(this).index();
        if (index > currentStep) {
            e.preventDefault();
        } else {
            currentStep = index;
            updateBreadcrumbUI(currentStep);
            showStep(currentStep);
        }
    });

    $(".meal-card-wrapper").on("click", function () {
        const mealCountText = $(this).find(".meal-count").text().trim();
        const mealCount = parseInt(mealCountText.match(/\d+/)[0]);

        localStorage.setItem("mealCount", mealCount.toString());

        const planPrice = $(this).find(".plan-price .price-highlight").text().trim();
        const perMealPrice = $(this).find(".per-meal-price").text().trim();

        localStorage.setItem("planPrice", planPrice);
        localStorage.setItem("perMealPrice", perMealPrice);

        $("#days-mealCount").text(mealCountText);
        $("#days-planPrice").text(planPrice);
        $("#days-perMealPrice").text(perMealPrice);

        currentStep = 1;
        updateBreadcrumbUI(currentStep);
        showStep(currentStep);
    });
    $(".next-btn").on("click", function () {
        const selectedDate = $(".date-option.selected").data("date");
        localStorage.setItem("selectedDate", selectedDate);
        currentStep = 2;
        updateBreadcrumbUI(currentStep);
        showStep(currentStep);
    });

    // Add click handler for meals section next button
    $(".cart-next-btn").on("click", function () {
        if (!$(this).prop('disabled')) {
            currentStep = 3;
            updateBreadcrumbUI(currentStep);
            showStep(currentStep);
        }
    });

    function updateBreadcrumbUI(step) {
        steps.each(function (index) {
            const link = $(this).find("a");

            if (index === step) {
                $(this).addClass("breadcrumb-item-active").removeClass("disabled");
                link.addClass("breadcrumb-link-active").removeClass("breadcrumb-link");
            } else {
                $(this).removeClass("breadcrumb-item-active");
                link.removeClass("breadcrumb-link-active").addClass("breadcrumb-link");

                if (index > step) {
                    $(this).addClass("disabled");
                } else {
                    $(this).removeClass("disabled");
                }
            }
        });
    }
    function showStep(stepIndex) {
        sections.forEach((sel, i) => {
            $(sel).toggle(i === stepIndex);
        });
    }
});