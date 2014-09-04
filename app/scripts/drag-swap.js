define([
	'jquery'
], function ($) {
	'use strict';

	var IS_TOUCH_DEVICE = ('ontouchstart' in document.documentElement);
	var dragging = false;
	var $clone;
	var dragElement;
	var originalClientX, originalClientY;
	var $elements;
	var leftOffset, topOffset;

	var dragEvents = (function () {
		if (IS_TOUCH_DEVICE) {
			return {
				START: 'touchstart',
				MOVE: 'touchmove',
				END: 'touchend'
			};
		}
		else {
			return {
				START: 'mousedown',
				MOVE: 'mousemove',
				END: 'mouseup'
			};
		}
	}());

	function init() {
		$(document).on(dragEvents.MOVE, dragMoveHandler)
			.on(dragEvents.END, dragEndHandler);
	}

	$.fn.swappable = function() {
		$elements = this;

		// bindings to trigger drag on element
		this.on(dragEvents.START, dragStartHandler);

		function dragStartHandler(e) {
			e.stopPropagation();
			dragging = true;
			dragElement = this;
			$clone = clone($(this));
			originalClientX = e.clientX;
			originalClientY = e.clientY;

			leftOffset = dragElement.offsetLeft;
			topOffset = dragElement.offsetTop;

			// hide dragged element
			dragElement.style.opacity = 0;
		}
	};

	function clone($element) {
		var $clone = $element.clone();

		$clone.css({
			position: 'absolute',
			width: $element.outerWidth(),
			height: $element.outerHeight(),
			left: dragElement.offsetLeft,
			top: dragElement.offsetTop,
			'z-index': 100000
		});

		$element.parent().append($clone);

		return $clone;
	}

	function dragMoveHandler(e) {
		if (!dragging) { return; }

		e.stopPropagation();

		$clone.css({
			left: leftOffset + e.clientX - originalClientX,
			top: topOffset + e.clientY - originalClientY
		});

		// var hoveredElement = getHoveredElement($clone, $elements);
		// if (hoveredElement && currentHoveredElement && hoveredElement !== currentHoveredElement) {
		// 	shiftElements(dragElement, hoveredElement);
		// }

		shiftHoveredElement($clone, $(dragElement), $elements);

		// currentHoveredElement = hoveredElement;
		// currentHoveredElement && console.log(currentHoveredElement);
	}

	function dragEndHandler() {
		if (dragging) {
			dragging = false;
			$clone.remove();
			dragElement.style.opacity = 1;
		}
	}

	/**
	 * find the element on which the dragged element is hovering
	 * @return {DOM Object} hovered element
	 */
	function getHoveredElement($dragElement, $swappableElements) {
		var dragElementOffset = $dragElement.offset();
		var elemWidth = $dragElement.width();
		var elemHeight = $dragElement.height();

		for (var i = 0; i < $swappableElements.length; i++) {
			var offset = $swappableElements.eq(i).offset();

			// check if this element position is overlapping with dragged element
			var overlappingX = (offset.left < dragElementOffset.left + elemWidth) &&
				(offset.left + elemWidth > dragElementOffset.left);

			var overlappingY = (offset.top < dragElementOffset.top + elemHeight) &&
				(offset.top + elemHeight > dragElementOffset.top);

			// console.log('values: ', overlappingX, overlappingY);

			var inRange = overlappingX && overlappingY;

			if (inRange) {
				return $swappableElements.eq(i)[0];
			}
		}
	}

	function shiftHoveredElement($clone, $dragElement, $swappableElements) {
		var hoveredElement = getHoveredElement($clone, $swappableElements);

		if (hoveredElement !== $dragElement[0]) {
			// shift all other elements to make space for the dragged element
			var hoveredElementIndex = $swappableElements.index(hoveredElement);
			var dragElementIndex = $swappableElements.index($dragElement);
			if (hoveredElementIndex < dragElementIndex) {
				$(hoveredElement).before($dragElement);
			} else {
				$(hoveredElement).after($dragElement);
			}
		}

	}

	// initialize
	init();

});
