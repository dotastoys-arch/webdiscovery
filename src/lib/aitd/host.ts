import { headers } from 'next/headers';
import { isAitdDomain } from './domains';

// Basispad voor links: "" op aitdconsulting.eu, "/aitd" op webdiscovery.nl.
export async function aitdBase(): Promise<string> {
  return isAitdDomain((await headers()).get('host')) ? '' : '/aitd';
}
