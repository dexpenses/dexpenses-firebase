export interface GSUrl {
  bucket: string;
  path: string[];
  filename?: string;
  fullPath: string;
  url: string;
}

/**
 * Parse the given url into its parts
 * @param url the google cloud storage url to parse
 * @returns null if the url is invalid, otherwise the parsed result
 */
export function parseGSUrl(url: string): GSUrl | null {
  const m = url.match(/^gs:\/\/([^\/]+)\/(.*)$/);
  if (!m) {
    return null;
  }
  const [, bucket, fullPath] = m;
  const pathSegments = fullPath.split('/');
  let filename: string | undefined;
  if (!fullPath.endsWith('/')) {
    filename = pathSegments.pop();
    if (!filename) {
      return null;
    }
  } else {
    pathSegments.pop(); // remove empty string at the end
  }
  return {
    bucket,
    path: pathSegments,
    filename,
    fullPath,
    url,
  };
}
