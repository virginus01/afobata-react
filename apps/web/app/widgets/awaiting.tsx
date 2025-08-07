import Image from 'next/image';
import React from 'react';
import styles from '@/app/widgets/AwaitingComponent.module.css';

interface AwaitingComponentProps {
  siteName?: string;
  path?: string;
  data: any;
}

const AwaitingComponent: React.FC<AwaitingComponentProps> = ({
  siteName = 'SITE',
  path = '',
  data = '',
}) => {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily: "'Ubuntu', sans-serif",
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        color: '#344A5E',
      }}
    >
      <div className={styles.wrapper}>
        <div
          style={{
            display: 'grid',
            height: '100%',
            alignItems: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Image
              style={{
                position: 'relative',
                zIndex: 10,
                padding: '1em',
                maxWidth: '100%',
              }}
              height={500}
              width={500}
              src="/images/components/active-img.png"
              alt="Start"
            />
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(to top, #232769, #5D619D)',
            height: '100%',
          }}
        >
          <div
            style={{
              background: 'url("/images/components/active-bg-top-right.png") top right no-repeat',
              height: '100%',
            }}
          >
            <div
              style={{
                background:
                  'url("/images/components/active-bg-footer-left.png") bottom left no-repeat',
                height: '100%',
              }}
            >
              <div
                style={{
                  background:
                    'url("/images/components/active-bg-footer-right.png") bottom right no-repeat',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gridTemplateColumns: '200px auto',
                    height: '100%',
                  }}
                >
                  <div className={styles['border-top']}></div>

                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      gridTemplateRows: 'auto auto auto',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        color: '#fff',
                        lineHeight: 2,
                        padding: '5px',
                        fontWeight: 'bold',
                        paddingBottom: '20px',
                      }}
                    >
                      <div
                        className=" text-gray-50"
                        dangerouslySetInnerHTML={{ __html: data ?? '' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwaitingComponent;
