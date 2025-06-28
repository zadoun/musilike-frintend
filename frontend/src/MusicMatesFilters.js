import React from "react";
import Slider from '@mui/material/Slider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const GENRES = [
  "Pop", "Rock", "Rap", "Jazz", "Electro", "Classique", "Folk", "Reggae", "Metal", "R&B"
];
const INSTRUMENTS = [
  "Guitarist", "Singer", "Drummer", "Pianist", "Bassist", "Violinist", "DJ", "Saxophonist", "Trumpeter", "Producer", "Rapper"
];
const NIVEAU_LABELS = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced"
};

export default function MusicMatesFilters({
  compatibility,
  onCompatibilityChange,
  genres,
  onGenresChange,
  gender,
  onGenderChange,
  ageRange,
  onAgeRangeChange,
  musicianTypes,
  onMusicianTypesChange,
  minLevel,
  onMinLevelChange,
  onReset
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      padding: 24,
      marginBottom: 18,
      display: "flex",
      flexWrap: "wrap",
      gap: 24,
      alignItems: "center"
    }}>
      {/* Compatibilité musicale */}
      <div style={{minWidth:270}}>
        <label style={{fontWeight:600, marginRight:12}}>Compatibility:</label>
        <Slider
          value={compatibility}
          onChange={(e, newVal) => onCompatibilityChange(newVal)}
          valueLabelDisplay="auto"
          min={0}
          max={100}
          sx={{ width: 160, display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}
        />
        <span style={{marginLeft:12}}>{compatibility[0]}% - {compatibility[1]}%</span>
      </div>
      {/* Genres musicaux */}
      <div style={{minWidth:220}}>
        <label style={{fontWeight:600, marginRight:12}}>Music genres:</label>
        <Autocomplete
          multiple
          options={GENRES}
          value={genres}
          onChange={(event, newValue) => onGenresChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Music genres" placeholder="Choose..." size="small" />
          )}
          sx={{ minWidth: 180, maxWidth: 260, background: '#fff', borderRadius: 1, display: 'inline-block' }}
        />
      </div>
      {/* Genre utilisateur */}
      <div>
        <label style={{fontWeight:600}}>Gender:</label>
        <select value={gender} onChange={e => onGenderChange(e.target.value)} style={{minWidth:90}}>
          <option value="">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      {/* Âge */}
      <div style={{minWidth:220}}>
        <label style={{fontWeight:600, marginRight:12}}>Age:</label>
        <Slider
          value={ageRange}
          onChange={(e, newVal) => onAgeRangeChange(newVal)}
          valueLabelDisplay="auto"
          min={16}
          max={100}
          sx={{ width: 120, display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}
        />
        <span style={{marginLeft:12}}>{ageRange[0]} - {ageRange[1]} years</span>
      </div>
      {/* Musicien (type/instrument) */}
      <div style={{minWidth:220}}>
        <label style={{fontWeight:600, marginRight:12}}>Musician:</label>
        <Autocomplete
          multiple
          options={INSTRUMENTS}
          value={musicianTypes}
          onChange={(event, newValue) => onMusicianTypesChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Instrument(s)" placeholder="Choose..." size="small" />
          )}
          sx={{ minWidth: 160, maxWidth: 220, background: '#fff', borderRadius: 1, display: 'inline-block' }}
        />
      </div>
      {/* Niveau minimum */}
      <div style={{minWidth:170}}>
        <label style={{fontWeight:600, marginRight:12}}>Min level:</label>
        <Slider
          value={minLevel}
          onChange={(e, newVal) => onMinLevelChange(newVal)}
          min={1}
          max={3}
          step={1}
          marks={[
            { value: 1, label: '' },
            { value: 2, label: '' },
            { value: 3, label: '' }
          ]}
          valueLabelDisplay="off"
          sx={{ width: 110, display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}
        />
        <span style={{marginLeft:12, fontWeight:600, fontSize:16}}>{NIVEAU_LABELS[minLevel]}</span>
      </div>
      {/* Reset */}
      <button onClick={onReset} style={{marginLeft:16, background:"#eee", border:"none", borderRadius:6, padding:"6px 12px", cursor:"pointer"}}>Reset</button>
    </div>
  );
}
