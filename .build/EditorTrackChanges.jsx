import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import contentStyles from './trackchanges/trackchanges.css?raw';
import { setupTrackChanges, TRACK_CHANGES_VALID_ELEMENTS } from './trackchanges/trackchanges.js';

// In-browser image upload so the Upload tab appears without a backend.
const imagesUploadHandler = (blobInfo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Upload failed');
    reader.readAsDataURL(blobInfo.blob());
  });

// The same free self-hosted plugin set as the blog editor (src/AddBlog.jsx),
// minus `autoresize` so the fixed height applies. `accordion` and `importcss`
// are the two the track-changes editor was missing.
const PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave', 'charmap', 'code',
  'codesample', 'directionality', 'emoticons', 'fullscreen', 'image', 'importcss',
  'insertdatetime', 'link', 'lists', 'media', 'nonbreaking', 'pagebreak',
  'preview', 'quickbars', 'save', 'searchreplace', 'table', 'visualblocks',
  'visualchars', 'wordcount',
];

// Every button group from the blog editor (src/AddBlog.jsx) plus the track
// changes controls as their own trailing group.
const TOOLBAR = [
  'undo redo',
  'bold italic underline strikethrough',
  'blocks fontfamily',
  'fontsize lineheight',
  'alignleft aligncenter alignright alignjustify',
  'bullist numlist',
  'forecolor backcolor removeformat',
  'outdent indent',
  'ltr rtl',
  'link unlink anchor',
  'image media table',
  'charmap emoticons pagebreak hr',
  'accordion codesample',
  'searchreplace visualblocks visualchars code',
  'save fullscreen preview',
  'tctrack tcaccept tcreject tcacceptall tcrejectall tcaddcomment',
].join(' | ');

const INITIAL_CONTENT =`<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong> Global Healthcare Virtual Assistant Market Overview</strong></span></h2>
<p><span style="font-size: 14pt;">According to Kings Research analysis, the global healthcare virtual assistant market size was recorded at USD 516.7 million in 2025 and is projected to reach USD 2639.1 million by 2033, growing at a CAGR of 23.01% over the forecast period from&nbsp;2026 to 2033.</span></p>
<p><span style="font-size: 14pt;">The market is expanding significantly, mainly due to the rising adoption of AI-driven solutions targeted at improving patient engagement and operational efficiency. The surge in administrative workloads associated with the healthcare domain and the&nbsp;shortage of skilled personnel are&nbsp;prompting developers to innovate virtual assistant platforms that enable the&nbsp;automation of scheduling, billing, patient communication, and care coordination activities. </span></p>
<p><span style="font-size: 14pt;">Moreover, the rise in demand for convenient, personalized, and round-the-clock healthcare access is further supporting the adoption of <a href="https://www.kingsresearch.com/intelligent-virtual-assistant-market-1862" target="_blank" rel="noopener">virtual assistants</a>, with cloud-based and hybrid deployments gaining traction due to their scalability, flexibility, and ability to integrate with healthcare information systems.&nbsp;</span></p>
<figure class="image align-center" style="text-align: justify;"><img src="https://app.kingsresearch.com/uploads/media/1790328547492-infographics-_-healthcare-virtual-assistant-market.jpg" alt="" width="1000" height="1000" />
<figcaption></figcaption>
</figure>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Key Market Highlights </strong></span></h2>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;">The global healthcare virtual assistant market size was&nbsp;USD 516.7 million in 2025 and is estimated to reach USD 2639.1 million by 2033.</span></li>
<li><span style="font-size: 14pt;">The healthcare virtual assistant market growth is projected at a CAGR of 23.01% from 2026 to 2033.</span></li>
<li><span style="font-size: 14pt;">North America healthcare virtual assistant market share was estimated at 60.35% in 2025, registering a valuation of USD 311.8 million</span></li>
<li><span style="font-size: 14pt;">The cloud segment accounted for the largest share of 71.57%, with a valuation of USD 369.8 million in 2025.</span></li>
<li><span style="font-size: 14pt;">The patient engagement and access segment is poised to register the fastest CAGR of 24.68% over the forecast period, reaching USD 1,010.9 million in 2033.</span></li>
<li><span style="font-size: 14pt;">The hospitals and health systems segment held the largest share of 61.35% in 2025, valued at USD 317.01 million.</span></li>
<li><span style="font-size: 14pt;">The Middle East and Africa is anticipated to expand at the fastest CAGR of 26.26% through the projection period.&nbsp;</span></li>
</ul>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Market Dynamics </strong></span></h2>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>How Do Rising Administrative Workloads Drive The Demand For Healthcare Virtual Assistants?</strong></span></h3>
<p><span style="font-size: 14pt;">The increasing demand to reduce manual administrative workloads, combat worker shortages, and address rising patient demands for 24/7 digital care is highlighting the need for healthcare virtual assistants. Increasing patient volumes and a shortage of trained administrative personnel create challenges for healthcare providers in managing appointment scheduling, insurance verification, patient communication, and billing coordination efficiently.</span></p>
<p><span style="font-size: 14pt;">The World Health Organization (WHO) has projected a shortfall of 11.1 million health workers by 2030 in lower- and middle-income countries, including doctors, nursing staff, administrative personnel, and operations staff. This signals the requirement for technology-enabled automation solutions. Market players are thus introducing platforms that integrate AI capabilities, support a broader range of healthcare applications, and enable greater integration across clinical and administrative workflows.</span></p>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;"><strong>In August 2026,</strong> Microsoft launched Dragon Copilot 5.0, which enables AI-powered clinical documentation, workflow automation, and EHR integration. This demonstrates the expansion of healthcare virtual assistants from basic patient support toward integrated clinical and administrative workflows.</span></li>
<li><span style="font-size: 14pt;"><strong>In June 2026,</strong> Novant Health introduced Aubrey, an AI-powered virtual assistant designed to support patients and care teams. The platform offers personalized preoperative reminders, care information, scheduling support, and 24/7 patient assistance, highlighting the growing integration of AI-enabled virtual assistants into healthcare workflows.&nbsp;</span></li>
</ul>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>How Do Data Security Challenges Restrain The Development Of The Healthcare Virtual Assistant Market?</strong></span></h3>
<p><span style="font-size: 14pt;">Protection of sensitive patient and healthcare data from cyberattacks and data theft is limiting the adoption of healthcare virtual assistants. The increasing frequency of malware, ransomware, phishing, and data breaches compromises patient confidentiality and creates&nbsp;legal and regulatory challenges, restraining the integration of virtual assistants in healthcare.</span></p>
<p><span style="font-size: 14pt;">According to <a href="https://www.ibm.com/downloads/documents/us-en/16dd90a741c46c2c" target="_blank" rel="noopener noreferrer">IBM</a> Corporation, healthcare is among the most expensive industries in terms of data&nbsp;breaches, with an average cost of a healthcare data breach reported at USD 7.42 million in 2025. Attackers often&nbsp;target patients' personally identifiable information (PII), which is frequently used for identity theft, insurance fraud, and other associated financial crimes. To address this challenge, industry players encrypt sensitive data both in transit and at rest and back up data to secure, off-site locations to mitigate risks of data loss or breaches.&nbsp;</span></p>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>How Is The Adoption Of Vocal Biomarkers Emerging As A Key Healthcare Virtual Assistant Market Trend?</strong></span></h3>
<p><span style="font-size: 14pt;">Vocal biomarkers are emerging as non-invasive diagnostic tools for the early screening of <a href="https://www.kingsresearch.com/report/cognitive-search-market-2658" target="_blank" rel="noopener">cognitive</a>, behavioral, and neurological conditions through the analysis of patients' voices. This approach enables clinical support for patients with underlying medical conditions, including mild cognitive impairment, depression, anxiety, Parkinson&rsquo;s, Alzheimer&rsquo;s, multiple sclerosis, and Huntington&rsquo;s disease. This results in earlier identification of potential health concerns and facilitates timely clinical intervention.</span></p>
<p><span style="font-size: 14pt;">Additionally, the integration of vocal biomarkers with virtual assistants embedded in smartphones and <a href="https://www.kingsresearch.com/wearable-healthcare-devices-market-182" target="_blank" rel="noopener">wearable devices</a> is further poised to enable continuous monitoring and more proactive, personalized healthcare, presenting opportunities for market development. Market players are adopting expansion strategies through fundraising and product development aimed at capturing market share.</span></p>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;"><strong>In June 2025,</strong> Ellipsis Health raised USD 45 million in Series A funding for the launch of Sage, an emotionally intelligent AI care manager that uses voice biomarkers and AI trained using&nbsp;millions of clinical conversations. The platform provides personalized patient engagement while reducing staffing pressures, lowering care-management costs, and potentially improving&nbsp;patient outcomes by automating time-intensive care tasks.&nbsp;</span></li>
</ul>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Market Segmentation</strong></span></h2>
<table width="100%">
<tbody>
<tr>
<td width="25%">
<p><span style="font-size: 14pt;"><strong>Segmentation</strong></span></p>
</td>
<td colspan="2" width="74%">
<p><span style="font-size: 14pt;"><strong>Details</strong></span></p>
</td>
</tr>
<tr>
<td width="25%">
<p><span style="font-size: 14pt;">By Deployment</span></p>
</td>
<td colspan="2" width="74%">
<p><span style="font-size: 14pt;">Cloud, On-Premise, and Hybrid</span></p>
</td>
</tr>
<tr>
<td width="25%">
<p><span style="font-size: 14pt;">By Application</span></p>
</td>
<td colspan="2" width="74%">
<p><span style="font-size: 14pt;">Patient Engagement and Access, Clinical Support, Healthcare Operations, and Others</span></p>
</td>
</tr>
<tr>
<td width="25%">
<p><span style="font-size: 14pt;">By End User</span></p>
</td>
<td colspan="2" width="74%">
<p><span style="font-size: 14pt;">Hospitals and Health Systems, Physicians' Practices &nbsp;and Clinics, and Others</span></p>
</td>
</tr>
<tr>
<td rowspan="5" width="25%">
<p><span style="font-size: 14pt;">By Region</span></p>
</td>
<td width="15%">
<p><span style="font-size: 14pt;">North America</span></p>
</td>
<td width="59%">
<p><span style="font-size: 14pt;">U.S., Canada, and Mexico</span></p>
</td>
</tr>
<tr>
<td width="15%">
<p><span style="font-size: 14pt;">Europe</span></p>
</td>
<td width="59%">
<p><span style="font-size: 14pt;">France, UK, Spain, Germany, Italy, Russia, and Rest of Europe</span></p>
</td>
</tr>
<tr>
<td width="15%">
<p><span style="font-size: 14pt;">Asia-Pacific</span></p>
</td>
<td width="59%">
<p><span style="font-size: 14pt;">China, Japan, India, Australia, ASEAN, South Korea, and Rest of Asia-Pacific</span></p>
</td>
</tr>
<tr>
<td width="15%">
<p><span style="font-size: 14pt;">Middle East and Africa</span></p>
</td>
<td width="59%">
<p><span style="font-size: 14pt;">Turkey, U.A.E., Saudi Arabia, South Africa, and Rest of Middle East &amp; Africa</span></p>
</td>
</tr>
<tr>
<td width="15%">
<p><span style="font-size: 14pt;">South and Central America</span></p>
</td>
<td width="59%">
<p><span style="font-size: 14pt;">Brazil, Argentina, and&nbsp; Rest of South and Central America</span></p>
</td>
</tr>
</tbody>
</table>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Segmental Analysis </strong></span></h2>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Which Deployment Segment Held The Largest Share Of The Global Healthcare Virtual Assistant Market?</strong></span></h3>
<p><span style="font-size: 14pt;">The cloud segment accounted for&nbsp;the largest share of 71.57% in 2025, with&nbsp;a valuation of USD 369.8 million. This growth is attributed to its&nbsp;high scalability, advanced data processing, and robust&nbsp;security infrastructure for handling healthcare data. The adoption of AI virtual assistants in healthcare enables the provision of high computational capabilities, continuous uptime, and data integration required to handle complex clinical workflows safely and efficiently.<strong>&nbsp;</strong></span></p>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Which Application Segment Is Anticipated To Register The Fastest Cagr Over The Forecast Period?</strong></span></h3>
<p><span style="font-size: 14pt;">The patient engagement and access segment is anticipated to register the fastest CAGR of 24.68% over the forecast period, reaching USD 1,010.9 million in 2033. This growth is fueled by the increasing adoption of AI-powered healthcare virtual assistants for <a href="https://www.ijert.org/ai-in-healthcare-enhancing-patient-engagement-through-virtual-assistants" target="_blank" rel="noopener">appointment scheduling</a>, medication reminders, health information, care navigation, and patient support. These solutions enhance accessibility, streamline patient-provider communication, and enable proactive, continuous engagement, contributing significantly to market expansion.</span></p>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Regional Analysis </strong></span></h2>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>What Is The Market Scenario Across Key Regions In The Global Healthcare Virtual Assistant Market?</strong></span></h3>
<p><span style="font-size: 14pt;">By region, the global healthcare virtual assistant market has been segmented into North America, Europe, Asia Pacific, the Middle East and Africa, and South and Central America.</span></p>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>North America </strong></span></h3>
<p><span style="font-size: 14pt;">North America accounted for the largest share of 60.35% in 2025, with a valuation of USD 311.8 million. This growth is attributed to the vast software development ecosystem, which drives innovation and deployment of tools aimed at advancing&nbsp;virtual assistants for the healthcare sector. The vast digital health ecosystem across the U.S. is further transforming the market by connecting technology, data, providers, and consumers to develop seamless and personalized healthcare products and services, including virtual assistants, thereby enabling convenient access and improved patient experiences.</span></p>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;">In December 2025, <a href="https://www.elevancehealth.com/newsroom/elevance-health-expands-virtual-assistant-to-help-members-navigate-healthcare-with-confidence" target="_blank" rel="noopener noreferrer">Elevance Health</a> expanded its Virtual Assistant to provide members with personalized, conversational support for understanding benefits, estimating costs, finding in-network care, and managing healthcare needs. The solution integrates with existing digital platforms to simplify healthcare navigation, improve engagement, and enable members to access relevant healthcare data.&nbsp;&nbsp;</span></li>
</ul>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Middle East and Africa </strong></span></h3>
<p><span style="font-size: 14pt;">The Middle East and Africa healthcare virtual assistant market forecast projects the region to be the fastest-growing market, expanding at a CAGR of 26.26% to reach USD 47.02 million by 2033. The rising population, along with an estimated internet penetration rate of 67.2%, creates a strong foundation for mobile health, virtual care, digital assistants, and connected healthcare services. Moreover, the rapid adoption of AI driven virtual healthcare assistants and allied technologies in the UAE and Saudi Arabia, where governments and healthcare organizations are exploring AI applications in areas such as clinical decision support,healthcare chatbots,&nbsp;and <a href="https://www.kingsresearch.com/report/global-precision-medicine-market-3169" target="_blank" rel="noopener">precision medicine</a>, further creates new growth&nbsp;opportunities.</span></p>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Europe, Asia Pacific, and South and Central America</strong>&nbsp;</span></h3>
<p><span style="font-size: 14pt;">Europe represents a significant market for healthcare virtual assistants, driven by the growing digitization of healthcare systems, increasing demand for patient engagement virtual assistant in form of healthcare chatbots and other AI driven conversational technologies. The region&rsquo;s focus on improving healthcare accessibility and operational efficiency is creating opportunities for virtual assistants across patient support and care navigation.</span></p>
<p><span style="font-size: 14pt;">Asia Pacific is expected to witness strong growth in the healthcare virtual assistant market, supported by expanding digital healthcare infrastructure, increasing smartphone and internet penetration, and growing adoption of AI-enabled healthcare solutions. The region&rsquo;s large and digitally connected population highlights the need for virtual assistants to improve access, <a href="https://www.kingsresearch.com/patient-engagement-solutions-market-1258" target="_blank" rel="noopener">patient engagement</a>, and healthcare navigation.</span></p>
<p><span style="font-size: 14pt;">South and Central America is emerging as a developing market for healthcare virtual assistants, supported by increasing digital healthcare adoption, expanding telemedicine services, and growing demand for convenient access to healthcare. Moreover, rising smartphone usage, investments in healthcare technology, and the expansion of virtual care services are boosting demand for AI-powered healthcare virtual assistants in the region.&nbsp;</span></p>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Competitive Landscape </strong></span></h2>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>How Are Strategic Technical Collaborations Transforming The Competitive Landscape Of The Global Healthcare Virtual Assistant Market?</strong></span></h3>
<p><span style="font-size: 14pt;">Numerous healthcare providers and technology companies operating in the global market are prioritizing developing innovative solutions to improve patient engagement and operational efficiency within the healthcare ecosystem. Market players are engaging in strategic technical partnerships and collaborations aimed at strengthening market presence and broadening service offerings across emerging market areas.&nbsp;</span></p>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;">In March 2025, AvaSure collaborated with Oracle Cloud Infrastructure (OCI) and NVIDIA to develop its AI-powered Virtual Care Assistant, which leverages OCI&rsquo;s AI infrastructure and NVIDIA technologies, including Riva and ACE. The collaboration aims to enhance patient communication, automate request triage, and support clinical and operational workflows across hospitals and healthcare systems.&nbsp;</span></li>
</ul>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Who Are The Key Players In The Global Healthcare Virtual Assistant Market?</strong></span></h3>
<ul style="text-align: justify;">
<li><span style="font-size: 14pt;">Docus, Inc.</span></li>
<li><span style="font-size: 14pt;">eGain Corporation</span></li>
<li><span style="font-size: 14pt;">HealthTap, Inc.</span></li>
<li><span style="font-size: 14pt;">IBM Corporation</span></li>
<li><span style="font-size: 14pt;">Infermedica</span></li>
<li><span style="font-size: 14pt;">MedRespond</span></li>
<li><span style="font-size: 14pt;">MEDVA</span></li>
<li><span style="font-size: 14pt;">Microsoft</span></li>
<li><span style="font-size: 14pt;">Oracle</span></li>
<li><span style="font-size: 14pt;">Radixweb</span></li>
<li><span style="font-size: 14pt;">Rezonate</span></li>
<li><span style="font-size: 14pt;">Sun Knowledge Inc.</span></li>
<li><span style="font-size: 14pt;">Tebra Technologies, Inc.</span></li>
<li><span style="font-size: 14pt;">Temark International, Inc.</span></li>
<li><span style="font-size: 14pt;">Verint Systems Inc.</span></li>
</ul>
<h2 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Research Methodology</strong></span></h2>
<p><span style="font-size: 14pt;"><strong>How We Gather This Information</strong></span></p>
<p><span style="font-size: 14pt;">Our methodology triangulates insights from multiple independent and publicly available research databases, which is further validated against regulatory filings and public company disclosures. All estimates are cross-verified; no single-source data is presented without validation.</span></p>
<p><span style="font-size: 14pt;"><img style="display: block; margin-left: auto; margin-right: auto;" src="https://app.kingsresearch.com/uploads/media/1785508246086-research-methodology.webp" alt="" width="1000" height="563" /></span></p>
<h3 style="text-align: justify;"><span style="font-size: 14pt;"><strong>Why Kings Research?</strong></span></h3>
<p><span style="font-size: 14pt;">Our custom offerings deliver tailored, data-driven intelligence and strategic guidance to help organizations identify, evaluate, and capitalize on key market opportunities.</span></p>
<p><img style="display: block; margin-left: auto; margin-right: auto;" src="https://app.kingsresearch.com/uploads/media/1785832495783-why-kings-research.webp" alt="" width="1000" height="563" /></p>
<div style="all: initial !important;">&nbsp;</div>`;

export default function EditorTrackChanges() {
  const apiRef = useRef(null);
  const [author, setAuthor] = useState('Vinod');
  const [enabled, setEnabled] = useState(true);

  // Keep the live editor's author in sync with the field.
  useEffect(() => {
    apiRef.current?.setAuthor(author);
  }, [author]);

  const withApi = (fn) => {
    const api = apiRef.current;
    if (api) fn(api);
  };

  const handleToggle = () =>
    withApi((api) => setEnabled(api.toggle()));

  const handleAccept = () => withApi((api) => api.acceptAll());
  const handleReject = () => withApi((api) => api.rejectAll());

  return (
    <div className="tc-page">
      <p className="hint">
        A free substitute for TinyMCE&apos;s premium <code>revisionhistory</code> /{' '}
        <code>comments</code>. Insertions are green-underlined, deletions red-struck, and
        comments yellow-highlighted; hovering a marker shows who changed it and when. The
        core in <code>src/trackchanges/trackchanges.js</code> is React-free so it can be
        ported like the <code>portable/</code> kit.
      </p>

      <div className="tc-bar">
        <label className="tc-field">
          <span>Author</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <button
          type="button"
          className={enabled ? 'btn primary' : 'btn'}
          onClick={handleToggle}
        >
          {enabled ? 'Tracking: ON' : 'Tracking: off'}
        </button>
        <button type="button" className="btn" onClick={handleAccept}>
          Accept all
        </button>
        <button type="button" className="btn" onClick={handleReject}>
          Reject all
        </button>
      </div>

      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        initialValue={INITIAL_CONTENT}
        init={{
          // Sizing
          height: 460,
          resize: true,

          // Bar / toolbar
          menubar: 'file edit view insert format tools table help',
          plugins: PLUGINS,
          toolbar: TOOLBAR,
          // 'wrap' keeps every button visible on extra rows instead of hiding
          // extras behind a "…" button.
          toolbar_mode: 'wrap',
          contextmenu: 'link image table',

          // Phone/tablet overrides (applied after the options above).
          mobile: {
            menubar: 'file edit view insert format tools table help',
            toolbar_mode: 'sliding',
          },

          // Status bar
          statusbar: true,
          elementpath: true,
          promotion: false,
          branding: false,
          placeholder: 'Type here — your edits are tracked.',

          // Track changes: marker styling for the iframe plus the attribute
          // allow-list (p[*] keeps style_formats classes such as "lead").
          content_style: contentStyles,
          extended_valid_elements: 'p[*],' + TRACK_CHANGES_VALID_ELEMENTS,

          // Image uploads
          automatic_uploads: true,
          image_uploadtab: true,
          image_advtab: true,
          image_title: true,
          image_caption: true,
          images_file_types: 'jpeg,jpg,png,gif,webp,svg',
          images_reuse_filename: true,
          images_upload_handler: imagesUploadHandler,

          // Links
          link_default_target: '_blank',
          link_assume_external_targets: true,
          link_context_toolbar: true,

          // Media
          media_live_embeds: true,

          // Paste (left native by the tracking core)
          paste_data_images: true,
          smart_paste: true,

          // Formatting
          block_formats:
            'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Preformatted=pre;Blockquote=blockquote',
          font_family_formats:
            'System UI=system-ui,sans-serif;Georgia=Georgia,serif;Times=Times New Roman,serif;Courier=Courier New,monospace;Arial=Arial,sans-serif',
          font_size_formats: '12px 14px 16px 18px 24px 36px',
          line_height_formats: '1 1.2 1.5 2',
          style_formats: [
            { title: 'Lead paragraph', block: 'p', classes: 'lead' },
            { title: 'Callout', block: 'div', classes: 'callout' },
            { title: 'Inline code', inline: 'code' },
          ],
          color_map: [
            '#000000', 'Black', '#ffffff', 'White', '#ef4444', 'Red',
            '#2563eb', 'Blue', '#16a34a', 'Green', '#f59e0b', 'Amber',
          ],

          // Code samples
          codesample_languages: [
            { text: 'HTML/XML', value: 'markup' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'CSS', value: 'css' },
            { text: 'JSON', value: 'json' },
            { text: 'Python', value: 'python' },
          ],

          // Autosave (draft kept in the browser)
          autosave_interval: '30s',

          // Quickbars — same as the blog editor, plus the Comment action.
          quickbars_selection_toolbar: 'bold italic | link h2 h3 blockquote | tcaddcomment',
          quickbars_insert_toolbar: 'image quicktable',

          // Pull page classes into the Formats menu
          importcss_append: true,

          // Tables
          table_sizing_mode: 'responsive',
          table_toolbar:
            'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',

          // Misc
          indent: true,
          forced_root_block: 'p',
          newline_behavior: 'block',
          directionality: 'ltr',
          content_language: 'en',
          a11y_advanced_options: true,
          xss_sanitization: true,
          deprecation_warnings: true,
          noneditable_class: 'mceNonEditable',
          relative_urls: false,
          remove_script_host: false,

          setup: (editor) => {
            apiRef.current = setupTrackChanges(editor, {
              author,
              enabled: true, // true for track changes and false for plain editing
            });
            // Keep the React toggle label in step with the toolbar button.
            editor.on('TrackChangesStateChange', () =>
              setEnabled(editor.trackChanges.isEnabled())
            );
          },
        }}
      />
    </div>
  );
}
