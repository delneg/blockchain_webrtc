declare namespace StyleCssNamespace {
  export interface StyleCss {
    "control-btn": string;
    controls: string;
    hide: string;
    "local-video-wrapper": string;
    localVideo: string;
    remoteVideo: string;
    status: string;
    "video-wrapper": string;
  }
}

declare const StyleCssModule: StyleCssNamespace.StyleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleCssNamespace.StyleCss;
};

export = StyleCssModule;
