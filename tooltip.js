IL = {};
IL.tooltips = [];

IL.tooltip = function (config) {
   const id = config.id;
   const placement = config.placement;
   if (IL.tooltips.indexOf(id) >= 0) {
      return;
   }
   if (!IL.tooltip_create_timeouts) {
      IL.tooltip_create_timeouts = {};
   }
   IL.tooltips.push(id);
   const element = document.getElementById(id);
   if (!element) {
      return;
   }
   if (document.getElementById(`il-tooltip-${element.id}`)) {
      return;
   }
   const title = element.getAttribute('title');
   if (!title || title === null || title == undefined) {
      return;
   }
   element.dataset.title = title;
   element.dataset.placement = placement;
   element.setAttribute('title', '');
   element.addEventListener('focus', IL.create_tooltip);
   element.addEventListener('mouseover', IL.create_tooltip);
   element.addEventListener('mouseout', IL.close_tooltip);
   element.addEventListener('focusout', IL.close_tooltip);
}

IL.close_tooltip = function(event) {
   const $this = document.getElementById(`il-tooltip-${event.target.id}`);
   if ($this) {
      $this.remove();
   }
}

IL.create_tooltip = function(event) {
   const parent = event.target;
   if (IL.tooltip_create_timeouts[parent.id]) {
      clearTimeout(IL.tooltip_create_timeouts[parent.id]);
   }
   IL.tooltip_create_timeouts[parent.id] = setTimeout(function () {
      if (document.getElementById(`il-tooltip-${parent.id}`)) {
         return;
      }
      document.querySelectorAll('[id^="il-tooltip"]').forEach(function(value) {
         value.remove();
      });
      const tooltip_template = '<div class="il-tooltip-inner"></div>';
      const tooltip = document.createElement('div');
      tooltip.innerHTML = tooltip_template;
      tooltip.querySelector('.il-tooltip-inner').innerHTML = parent.dataset.title;
      tooltip.setAttribute('role', 'tooltip');
      tooltip.classList.add('il-tooltip', 'il-tooltip-show');
      tooltip.id = 'il-tooltip-' + parent.id;
      document.body.appendChild(tooltip);
      const position = IL.position_tooltip(parent, tooltip, parent.dataset.placement);
      const arrow = document.createElement('div');
      arrow.classList.add('il-tooltip-arrow');
      //padding!!
      arrow.style.setProperty('--tooltip-height', ((tooltip.offsetHeight / 2) - 8) + 'px');
      arrow.style.setProperty('--tooltip-width', ((tooltip.offsetWidth / 2) - 4) + 'px');
      if (/top/.test(position.placement)) {
         tooltip.append(arrow);
      } else {
         tooltip.prepend(arrow);
      }
      parent.setAttribute('aria-labelledby', tooltip.id);
   }, 500);
   
}

IL.position_tooltip = function(parent, tooltip, placement) {
   let position = IL.get_tool_tip_placement(parent, tooltip, placement);
   let possible_positions = ['top', 'right', 'left', 'bottom', 'bottom-left', 'bottom-right', 'top-right', 'top-left'];
   let index = 0;
   let current_position = position;
   let current_placement = placement;
   while (index < possible_positions.length) {
      let try_next = false;
      if (current_position.left < 0 || current_position.top < 0) {
         try_next = true;
      } else if (current_position.left + current_position.tooltip_width > window.innerWidth) {
         try_next = true;
      } else if (current_position.top + current_position.tooltip_height > window.innerHeight) {
         try_next = true;
      }
      if (try_next) {
         current_placement = possible_positions[index];
         current_position = IL.get_tool_tip_placement(parent, tooltip, current_placement);
         ++index;
      } else {
         position = current_position;
         break;
      }
   }

   tooltip.style.left = position.left + "px";
   tooltip.style.top = position.top + "px";
   tooltip.classList.add(`il-${current_placement}`);
   position.placement = current_placement
   return position;
};

IL.get_tool_tip_placement = function(parent, tooltip, placement) {
   const parentCoords = parent.getBoundingClientRect();
   const parent_top = parseInt(parentCoords.top);
   const parent_bottom = parseInt(parentCoords.bottom);
   const parent_left = parseInt(parentCoords.left);
   const parent_right = parseInt(parentCoords.right);
   const parent_horz_center = parseInt(parentCoords.left) + (parseInt(parentCoords.width) / 2);
   const parent_vert_center = parseInt(parentCoords.top) + (parseInt(parentCoords.height) / 2);
   const tooltip_width = tooltip.offsetWidth;
   const tooltip_height = tooltip.offsetHeight;
   const dist = 10;
   const half_dist = 5;
   let left, top;
   switch (placement) {
      case 'top-left':
         top = parent_top - half_dist - tooltip_height;
         left = parent_left - half_dist - tooltip_width;
         break
      case 'top':
         top = parent_top - dist - tooltip_height;
         left = parent_horz_center - ((tooltip_width / 2) - 6);
         break;
      case 'top-right':
         top = parent_top - half_dist - tooltip_height;
         left = parent_right + half_dist;
         break;
      case 'right':
         left = parent_right + dist;
         top = parent_vert_center - (tooltip_height / 2);
         break;
      case 'bottom-right':
         left = parent_right + half_dist;
         top = parent_bottom + half_dist;
         break;
      case 'bottom':
         left = parent_horz_center - ((tooltip_width / 2) - 6);
         top = parent_bottom + dist;
         break;
      case 'bottom-left':
         left = parent_left - half_dist - tooltip_width;
         top = parent_bottom + half_dist;
         break;
      case 'left':
         left = parent_left - dist - tooltip_width;
         top = parent_vert_center - (tooltip_height / 2);
         break;
      default:
         //top
         top = parent_top - dist - tooltip_height;
         left = parent_horz_center - ((tooltip_width / 2) - 6);
   }
   return {
      left,
      top,
      tooltip_width,
      tooltip_height
   };
};

IL.cleanup_tooltips = function () {
   if (IL.tooltips) {
      let ids_to_keep = [];
      for (const id of IL.tooltips) {
         if (document.getElementById(id)) {
            ids_to_keep.push(id);
   
         }
      }
      IL.tooltips = ids_to_keep;
   }
   if (IL.tooltip_create_timeouts) {
      for (const id of Object.keys(IL.tooltip_create_timeouts)) {
         if (!document.getElementById(id)) {
            delete IL.tooltip_create_timeouts[id];
         }
      }
   }
}