import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div>
      <header>{/* Add your public header content */}</header>
      <main>
        <Outlet />
      </main>
      <footer>{/* Add your public footer content */}</footer>
    </div>
  );
}