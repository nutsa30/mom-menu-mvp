'use client';
import React from 'react';

/**
 * Torn paper / watercolor edge — ნამდვილი მოხეული ფურცლის ეფექტი.
 * გამოიყენება dark სექციის ბოლოში, ამომდინარე cream-ფერი.
 */
export function TornPaperEdge({
  fill = '#E8DDD0',
  height = 90,
  flip = false,
}: {
  fill?: string;
  height?: number;
  flip?: boolean;
}) {
  return (
    <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          width: '100%',
          height,
          transform: flip ? 'scaleY(-1) scaleX(-1)' : undefined,
        }}
      >
        {/* Layer 1 — main torn edge */}
        <path
          fill={fill}
          d="M0,100 L0,72
            L8,68 L12,74 L17,65 L22,71 L27,62 L32,68
            L37,59 L42,65 L47,56 L53,62 L58,53 L64,59
            L70,50 L76,57 L82,47 L88,54 L95,44 L101,51
            L108,42 L114,49 L121,39 L128,46 L135,36 L142,43
            L150,33 L157,40 L165,30 L172,37 L180,27 L188,34
            L196,24 L204,31 L213,21 L221,29 L230,19 L238,27
            L247,36 L256,26 L265,34 L274,24 L283,32 L292,22
            L301,30 L310,20 L319,28 L329,18 L338,26 L348,35
            L357,25 L367,33 L377,23 L387,31 L397,21 L407,30
            L417,19 L427,28 L437,38 L447,27 L457,36 L467,25
            L478,34 L488,23 L498,32 L509,22 L519,31 L530,21
            L540,30 L551,40 L562,29 L572,38 L583,27 L594,36
            L605,25 L616,34 L627,24 L638,33 L649,43 L660,32
            L671,41 L682,30 L694,39 L705,28 L717,37 L728,27
            L740,36 L751,46 L763,35 L775,44 L786,33 L798,42
            L810,31 L822,40 L834,30 L846,39 L858,29 L870,38
            L882,48 L894,37 L906,46 L918,35 L930,44 L942,34
            L955,43 L967,33 L979,42 L992,52 L1004,41 L1016,50
            L1029,39 L1041,48 L1054,38 L1066,47 L1079,37
            L1092,46 L1104,56 L1117,47 L1130,56 L1142,47
            L1155,56 L1168,47 L1181,56 L1194,48 L1207,57
            L1220,50 L1233,59 L1246,52 L1259,61 L1272,54
            L1285,63 L1298,56 L1311,65 L1324,58 L1337,67
            L1350,61 L1363,70 L1376,64 L1389,73 L1400,68
            L1410,75 L1420,70 L1430,76 L1440,72
            L1440,100 Z"
        />
        {/* Layer 2 — secondary texture / watercolor bleed */}
        <path
          fill={fill}
          fillOpacity={0.45}
          d="M0,100 L0,80
            L20,76 L40,82 L65,74 L90,80 L115,71 L140,78
            L165,68 L190,75 L215,65 L240,72 L265,62 L290,69
            L315,59 L340,66 L365,56 L390,63 L415,53 L440,61
            L465,51 L490,59 L515,49 L540,57 L565,47 L590,55
            L620,45 L650,53 L680,43 L710,51 L740,41 L770,49
            L800,39 L830,47 L860,37 L890,45 L920,35 L950,43
            L980,33 L1010,41 L1040,31 L1070,39 L1100,29 L1130,37
            L1160,47 L1190,57 L1220,50 L1250,60 L1280,55 L1310,64
            L1340,60 L1370,68 L1400,65 L1440,72
            L1440,100 Z"
        />
      </svg>
    </div>
  );
}

/**
 * ხელმოხეული ქაღალდის ეფექტი — გამოიყენება სექციის ზედა კიდეზე
 * (light სექცია dark-ის ქვეშ)
 */
export function TornPaperTop({
  fill = '#6F7A5C',
  height = 80,
}: {
  fill?: string;
  height?: number;
}) {
  return (
    <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height }}
      >
        <path
          fill={fill}
          d="M0,0 L1440,0 L1440,30
            L1430,26 L1420,32 L1410,25 L1400,31 L1388,23
            L1376,30 L1364,22 L1352,29 L1340,21 L1328,28
            L1316,20 L1304,27 L1292,19 L1280,26 L1268,18
            L1256,25 L1244,17 L1232,24 L1220,16 L1208,23
            L1196,35 L1184,26 L1172,34 L1160,25 L1148,33
            L1136,24 L1124,32 L1112,23 L1100,31 L1088,22
            L1076,30 L1064,21 L1052,29 L1040,20 L1028,28
            L1016,19 L1004,27 L992,18 L980,26 L968,17
            L956,25 L944,16 L932,24 L920,34 L908,25 L896,33
            L884,24 L872,32 L860,23 L848,31 L836,22 L824,30
            L812,21 L800,29 L788,20 L776,28 L764,19 L752,27
            L740,18 L728,26 L716,17 L704,25 L692,34 L680,25
            L668,33 L656,24 L644,32 L632,23 L620,31 L608,22
            L596,30 L584,21 L572,29 L560,20 L548,28 L536,19
            L524,27 L512,18 L500,26 L488,35 L476,26 L464,34
            L452,25 L440,33 L428,24 L416,32 L404,23 L392,31
            L380,22 L368,30 L356,21 L344,29 L332,20 L320,28
            L308,19 L296,27 L284,18 L272,26 L260,35 L248,26
            L236,34 L224,25 L212,33 L200,24 L188,32 L176,23
            L164,31 L152,22 L140,30 L128,21 L116,29 L104,20
            L92,28 L80,19 L68,27 L56,18 L44,26 L32,34 L20,27
            L8,33 L0,28 Z"
        />
      </svg>
    </div>
  );
}

/**
 * Watercolor blob — absolutely positioned organic decoration
 */
export function WatercolorBlob({
  color = '#F5F1E4',
  opacity = 0.12,
  size = 320,
  style = {},
}: {
  color?: string;
  opacity?: number;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 180"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size * 0.9, pointerEvents: 'none', ...style }}
    >
      <path
        fill={color}
        fillOpacity={opacity}
        d="M98,8 C116,2 140,10 158,28 C176,46 184,76 178,104
          C172,132 152,156 126,168 C100,180 68,176 46,158
          C24,140 10,108 12,78 C14,48 30,22 54,12
          C66,7 82,11 98,8 Z"
      />
      <path
        fill={color}
        fillOpacity={opacity * 0.5}
        d="M102,4 C124,-2 152,8 170,30 C188,52 192,90 182,118
          C172,146 146,168 116,174 C86,180 54,170 36,148
          C18,126 14,92 22,64 C30,36 52,14 78,6
          C88,3 96,5 102,4 Z"
      />
    </svg>
  );
}

/**
 * Soft peach/sage blob — section background decoration
 */
export function SoftBlobBackground({
  color = '#F5F1E4',
  opacity = 0.08,
  style = {},
}: {
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 500 380"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', ...style }}
    >
      <path
        fill={color}
        fillOpacity={opacity}
        d="M250,25 C300,5 370,20 410,65 C450,110 460,175 445,230
          C430,285 390,330 340,352 C290,374 228,372 178,348
          C128,324 90,278 72,226 C54,174 60,110 88,68
          C116,26 165,10 210,18 C226,21 240,28 250,25 Z"
      />
    </svg>
  );
}

/**
 * OrganicCloudDivider — between two light sections
 */
export function OrganicCloudDivider({
  fill = '#6F7A5C',
  opacity = 0.06,
  height = 50,
}: {
  fill?: string;
  opacity?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height, marginBottom: -1 }}
    >
      <path
        fill={fill}
        fillOpacity={opacity}
        d="M0,28 C40,18 80,38 120,28 C160,18 200,38 240,28
          C280,18 320,38 360,28 C400,18 440,38 480,28
          C520,18 560,38 600,28 C640,18 680,38 720,28
          C760,18 800,38 840,28 C880,18 920,38 960,28
          C1000,18 1040,38 1080,28 C1120,18 1160,38 1200,28
          C1240,18 1280,38 1320,28 C1360,18 1400,38 1440,28
          L1440,56 L0,56 Z"
      />
    </svg>
  );
}

/**
 * Footer torn paper wave — before footer
 */
export function FooterWave({ fill = '#6F7A5C' }: { fill?: string }) {
  return (
    <div style={{ position: 'relative', lineHeight: 0, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: 70 }}
      >
        <path
          fill={fill}
          d="M0,90 L0,62
            L10,58 L16,64 L22,55 L28,61 L35,52 L42,58
            L49,49 L56,55 L64,46 L71,52 L79,43 L87,49
            L95,40 L104,46 L112,37 L121,43 L130,34 L139,40
            L149,31 L158,38 L168,28 L178,35 L188,25 L198,32
            L209,22 L219,29 L230,39 L241,29 L252,36 L263,26
            L274,33 L285,23 L296,30 L308,20 L319,27 L331,37
            L343,27 L355,34 L367,24 L379,31 L392,21 L404,29
            L417,19 L429,27 L442,37 L455,26 L468,34 L481,24
            L494,32 L508,22 L521,30 L535,20 L548,28 L562,38
            L576,28 L590,36 L604,26 L618,34 L632,24 L647,32
            L661,22 L676,30 L690,40 L705,30 L720,38 L735,28
            L750,36 L765,26 L780,34 L796,44 L812,34 L828,42
            L844,32 L860,40 L876,30 L893,38 L909,28 L926,36
            L942,46 L959,36 L976,44 L993,34 L1010,42 L1027,32
            L1045,40 L1062,30 L1080,38 L1098,48 L1116,40
            L1134,48 L1152,40 L1170,48 L1188,42 L1206,50
            L1224,44 L1242,52 L1260,47 L1278,55 L1296,50
            L1314,58 L1332,54 L1350,62 L1368,57 L1386,65
            L1400,60 L1412,67 L1424,62 L1440,68
            L1440,90 Z"
        />
        {/* Secondary texture layer */}
        <path
          fill={fill}
          fillOpacity={0.4}
          d="M0,90 L0,74 L30,70 L60,76 L90,68 L120,74 L150,66
            L180,72 L210,64 L240,70 L270,62 L300,68 L330,60
            L360,66 L390,58 L420,64 L450,56 L480,62 L510,54
            L540,60 L570,52 L600,58 L630,50 L660,56 L690,60
            L720,54 L750,60 L780,54 L810,60 L840,54 L870,60
            L900,54 L930,60 L960,54 L990,60 L1020,56 L1050,62
            L1080,58 L1110,64 L1140,60 L1170,66 L1200,62 L1230,68
            L1260,65 L1290,72 L1320,68 L1350,74 L1380,70 L1440,76
            L1440,90 Z"
        />
      </svg>
    </div>
  );
}
