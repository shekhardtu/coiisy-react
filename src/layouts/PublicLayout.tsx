import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="h-full">
      <header>{/* Add your public header content */}</header>

        <Outlet />

      <footer>{/* Add your public footer content */}</footer>
    </div>
  );
}