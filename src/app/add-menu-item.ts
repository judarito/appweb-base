import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeqmmdvfzgswrjvhqkgx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcW1tZHZmemdz d3Jqdmhxa2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2ODY0MDUsImV4cCI6MjAyNTI2MjQwNX0.ZG_wRE6Q_qg4v7JF5-YhKMghT-RDgP7J5WDZvNwhs0I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMenuItem() {
  const { data, error } = await supabase
    .from('menus')
    .insert([
      {
        title: 'Usuarios',
        path: '/app/users',
        icon: 'people',
        parent_id: null,
        order: 3
      }
    ]);

  if (error) {
    console.error('Error adding menu item:', error);
  } else {
    console.log('Menu item added successfully:', data);
  }
}

addMenuItem();
