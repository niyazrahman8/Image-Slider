jQuery(document).ready(function($){
    var dragging = false,
        scrolling = false,
        resizing = false;
    //cache jQuery objects
    var imageComparisonContainers = $('.cd-image-container');
    //check if the .cd-image-container is in the viewport 
    //if yes, animate it
    checkPosition(imageComparisonContainers);
    $(window).on('scroll', function(){
        if( !scrolling) {
            scrolling =  true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function(){checkPosition(imageComparisonContainers);}, 100)
                : requestAnimationFrame(function(){checkPosition(imageComparisonContainers);});
        }
    });
    
    //make the .cd-handle element draggable and modify .cd-resize-img width according to its position
    imageComparisonContainers.each(function(){
        var actual = $(this);
        drags(actual.find('.cd-handle'), actual.find('.cd-resize-img'), actual, actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-image-label[data-type="modified"]'));
    });

    //upadate images label visibility
    $(window).on('resize', function(){
        if( !resizing) {
            resizing =  true;
            ( !window.requestAnimationFrame )
                ? setTimeout(function(){checkLabel(imageComparisonContainers);}, 100)
                : requestAnimationFrame(function(){checkLabel(imageComparisonContainers);});
        }
    });

    function checkPosition(container) {
        container.each(function(){
            var actualContainer = $(this);
            if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
                actualContainer.addClass('is-visible');
            }
        });

        scrolling = false;
    }

    function checkLabel(container) {
        container.each(function(){
            var actual = $(this);
            updateLabel(actual.find('.cd-image-label[data-type="modified"]'), actual.find('.cd-resize-img'), 'left');
            updateLabel(actual.find('.cd-image-label[data-type="original"]'), actual.find('.cd-resize-img'), 'right');
        });

        resizing = false;
    }

    //read the horizontal position from mouse, touch and pointer events alike
    function getPageX(e) {
        var original = e.originalEvent || e;
        if( original.touches && original.touches.length ) return original.touches[0].pageX;
        if( original.changedTouches && original.changedTouches.length ) return original.changedTouches[0].pageX;
        return original.pageX;
    }

    //draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
    function drags(dragElement, resizeElement, container, labelContainer, labelResizeElement) {
        dragElement.on("mousedown touchstart", function(e) {
            dragElement.addClass('draggable');
            resizeElement.addClass('resizable');

            var dragWidth = dragElement.outerWidth(),
                xPosition = dragElement.offset().left + dragWidth - getPageX(e),
                containerOffset = container.offset().left,
                containerWidth = container.outerWidth(),
                minLeft = containerOffset + 10,
                maxLeft = containerOffset + containerWidth - dragWidth - 10;

            function onMove(e) {
                if( !dragging) {
                    dragging =  true;
                    //read the position now: the event is stale by the time the frame runs
                    var pageX = getPageX(e);
                    ( !window.requestAnimationFrame )
                        ? setTimeout(function(){animateDraggedHandle(pageX, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, dragElement, resizeElement, labelContainer, labelResizeElement);}, 100)
                        : requestAnimationFrame(function(){animateDraggedHandle(pageX, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, dragElement, resizeElement, labelContainer, labelResizeElement);});
                }
                //keep the page from scrolling/selecting while the handle is being dragged
                e.preventDefault();
            }

            //mouse: follow the pointer on the document, so the drag survives leaving
            //the container and always ends, even if the button is released outside it
            $(document).on('mousemove.cd-drag', onMove).on('mouseup.cd-drag', stopDragging);
            //touch: the browser retargets every touchmove/touchend to the element the
            //gesture started on, so bind them there - on document they would be passive
            //listeners and preventDefault() would be ignored, letting the page scroll
            dragElement.on('touchmove.cd-drag', onMove).on('touchend.cd-drag touchcancel.cd-drag', stopDragging);

            e.preventDefault();
        });

        function stopDragging() {
            //remove the listeners added on mousedown, otherwise they pile up on
            //every drag and keep firing once the drag is over
            $(document).off('.cd-drag');
            dragElement.off('.cd-drag');
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
            dragging = false;
        }
    }

    function animateDraggedHandle(pageX, xPosition, dragWidth, minLeft, maxLeft, containerOffset, containerWidth, dragElement, resizeElement, labelContainer, labelResizeElement) {
        var leftValue = pageX + xPosition - dragWidth;   
        //constrain the draggable element to move inside his container
        if(leftValue < minLeft ) {
            leftValue = minLeft;
        } else if ( leftValue > maxLeft) {
            leftValue = maxLeft;
        }

        var widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
        
        dragElement.css('left', widthValue);
        resizeElement.css('width', widthValue); 

        updateLabel(labelResizeElement, resizeElement, 'left');
        updateLabel(labelContainer, resizeElement, 'right');
        dragging =  false;
    }

    function updateLabel(label, resizeElement, position) {
        if(position == 'left') {
            ( label.offset().left + label.outerWidth() < resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
        } else {
            ( label.offset().left > resizeElement.offset().left + resizeElement.outerWidth() ) ? label.removeClass('is-hidden') : label.addClass('is-hidden') ;
        }
    }
});
