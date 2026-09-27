import * as THREE from 'three'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
  }
}