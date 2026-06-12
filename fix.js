const fs = require('fs');

const b = fs.readFileSync('views/admin/branches.ejs', 'utf8');
fs.writeFileSync('views/admin/branches.ejs', b
    .replace('<%= edit_branch?. %>', "<%= edit_branch ? edit_branch['id'] : '' %>")
    .replace('<%= edit_branch?. ?? \'\' %>', "<%= edit_branch ? edit_branch['name_en'] : '' %>")
    .replace('<%= edit_branch?. ?? \'\' %>', "<%= edit_branch ? edit_branch['name_ar'] : '' %>")
    .replace('<%= edit_branch?. ?? \'\' %>', "<%= edit_branch ? edit_branch['address_en'] : '' %>")
    .replace('<%= edit_branch?. ?? \'\' %>', "<%= edit_branch ? edit_branch['address_ar'] : '' %>")
    .replace('<%= edit_branch?. ?? \'\' %>', "<%= edit_branch ? edit_branch['map_url'] : '' %>")
);

const o = fs.readFileSync('views/admin/offers.ejs', 'utf8');
fs.writeFileSync('views/admin/offers.ejs', o
    .replace('<%= edit_item?. %>', "<%= edit_item ? edit_item['id'] : '' %>")
    .replace('<%= edit_item?. %>', "<%= edit_item ? edit_item['image_url'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['title_en'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['title_ar'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['desc_en'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['desc_ar'] : '' %>")
    .replace('<%= edit_item?. ?? \'10\' %>', "<%= edit_item ? edit_item['discount_percentage'] : '10' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['valid_until'] : '' %>")
    .replace('<% if (edit_item && edit_item?.) { %>', "<% if (edit_item && edit_item['image_url']) { %>")
    .replace('<img src="../<%= edit_item?. %>"', "<img src=\"../<%= edit_item['image_url'] %>\"")
);

const s = fs.readFileSync('views/admin/services.ejs', 'utf8');
fs.writeFileSync('views/admin/services.ejs', s
    .replace('<%= edit_item?. %>', "<%= edit_item ? edit_item['id'] : '' %>")
    .replace('<%= edit_item?. %>', "<%= edit_item ? edit_item['image_url'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['name_en'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['name_ar'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['desc_en'] : '' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['desc_ar'] : '' %>")
    .replace('<%= edit_item?. ?? \'60\' %>', "<%= edit_item ? edit_item['duration_minutes'] : '60' %>")
    .replace('<%= edit_item?. ?? \'\' %>', "<%= edit_item ? edit_item['price'] : '' %>")
    .replace('<% if (edit_item && edit_item?.) { %>', "<% if (edit_item && edit_item['image_url']) { %>")
    .replace('<img src="../<%= edit_item?. %>"', "<img src=\"../<%= edit_item['image_url'] %>\"")
);
