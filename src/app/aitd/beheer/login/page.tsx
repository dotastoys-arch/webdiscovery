import { redirect } from 'next/navigation';
import { getEditor } from '@/lib/aitd/auth';
import { hasDb } from '@/lib/db';
import { aitdBase } from '@/lib/aitd/host';
import { AitdMark } from '../../logo';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const base = await aitdBase();
  if (hasDb() && (await getEditor())) redirect(`${base}/beheer`);
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <AitdMark className="h-9 w-auto" />
          <h1 className="mt-6 text-xl font-bold text-[#0B2E52]">Inloggen</h1>
          <p className="mt-1 text-sm text-slate-500">Beheer van de AITD Consulting-website</p>
        </div>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm base={base} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Wachtwoord vergeten? Neem contact op met je webbouwer (WebDiscovery).
        </p>
      </div>
    </div>
  );
}
