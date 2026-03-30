import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #f5faf9, #eef8f6)',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: 'flex',
            height: 88,
            width: 88,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            background: '#107a7a',
            color: 'white',
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          C
        </div>
      </div>
    ),
    size
  );
}

