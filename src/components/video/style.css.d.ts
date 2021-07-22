declare namespace StyleCssNamespace {
  export interface IStyleCss {
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

declare const StyleCssModule: StyleCssNamespace.IStyleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleCssNamespace.IStyleCss;
};

export = StyleCssModule;
