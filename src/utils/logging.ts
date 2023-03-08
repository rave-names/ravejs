const debug: boolean = false;

export function log(props: any) {
  if (debug) {
    // tslint:disable-next-line
    console.log(props);
  }
}
