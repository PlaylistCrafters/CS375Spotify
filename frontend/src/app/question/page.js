'use client';

import React, { useState } from 'react';



function setDisplay() {

}

export default function Home() {
const [displayQuestion, setDisplay] = useState(true);
  return (
  <div id="body">
    {displayQuestion ? <div> 

    </div> : <div>No question</div>}

  </div>
  );
}
