import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 96,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 40,
            borderRadius: 86,
            background: 'linear-gradient(180deg, #fff8eb, #ffffff)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            height: 220,
            width: 220,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            background: '#107a7a',
            color: 'white',
            fontSize: 140,
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

