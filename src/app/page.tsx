import { redirect } from 'next/navigation';

// Temporar, până la pasul 2 (sesiune + middleware): rădăcina duce la pagina de probă a temei.
export default function Home() {
  redirect('/dev/tema');
}
